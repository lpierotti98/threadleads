import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { scoreThread } from '@/lib/claude';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Get user keywords
    const { data: settings } = await serviceClient
      .from('users_settings')
      .select('keywords')
      .eq('user_id', user.id)
      .maybeSingle();

    const keywords = (settings?.keywords || []).filter(
      (k: { text: string; active: boolean }) => k.active
    );

    if (keywords.length === 0) {
      return NextResponse.json({ error: 'No active keywords' }, { status: 400 });
    }

    const MIN_SCORE = 20; // TODO: restore to 40+ after testing
    let totalSaved = 0;
    let redditFound = 0;
    let hnFound = 0;

    for (const kw of keywords) {
      const query = encodeURIComponent(kw.text);

      // Search Reddit
      try {
        const redditRes = await fetch(
          `https://www.reddit.com/search.json?q=${query}&sort=new&limit=25`,
          {
            headers: {
              'User-Agent': 'ThreadLeads/1.0',
            },
          }
        );
        if (redditRes.ok) {
          const redditData = await redditRes.json();
          const posts = redditData?.data?.children || [];
          redditFound += posts.length;

          // Log first 3 titles to confirm Reddit API is returning real data
          const preview = posts.slice(0, 3).map((p: { data: { title: string } }) => p.data.title);
          console.log(`[scan:reddit] First ${preview.length} titles for "${kw.text}":`, preview);

          for (const post of posts) {
            const d = post.data;
            const url = `https://www.reddit.com${d.permalink}`;

            // Check for duplicate
            const { data: existing } = await serviceClient
              .from('threads')
              .select('id')
              .eq('url', url)
              .eq('user_id', user.id)
              .maybeSingle();

            if (existing) continue;

            // Score with Claude
            try {
              const result = await scoreThread(
                d.title,
                d.selftext?.substring(0, 500) || ''
              );

              console.log(`[scan:reddit:raw] "${d.title}" — raw Claude response:`, result._raw);
              console.log(`[scan:reddit] "${d.title}" — score: ${result.score}, urgency: ${result.urgency}`);

              if (result.score >= MIN_SCORE) {
                await serviceClient.from('threads').insert({
                  user_id: user.id,
                  source: 'reddit',
                  title: d.title,
                  url,
                  content_preview: (d.selftext || '').substring(0, 300),
                  subreddit: d.subreddit,
                  score: result.score,
                  urgency: result.urgency,
                  score_reason: result.reason,
                  reply_generated: false,
                  marked_done: false,
                  marked_contacted: false,
                });
                totalSaved++;
              }
            } catch (err) {
              console.error(`[scan:reddit:error] Failed to score "${d.title}":`, err);
              // Skip this thread and continue
            }
          }
        }
      } catch {
        // Skip failed Reddit requests
      }

      // Search Hacker News
      try {
        const hnRes = await fetch(
          `https://hn.algolia.com/api/v1/search?query=${query}&tags=(ask_hn,show_hn)&hitsPerPage=25`
        );
        if (hnRes.ok) {
          const hnData = await hnRes.json();
          const hits = hnData?.hits || [];
          hnFound += hits.length;

          for (const hit of hits) {
            const url = `https://news.ycombinator.com/item?id=${hit.objectID}`;

            const { data: existing } = await serviceClient
              .from('threads')
              .select('id')
              .eq('url', url)
              .eq('user_id', user.id)
              .maybeSingle();

            if (existing) continue;

            try {
              const result = await scoreThread(
                hit.title || '',
                hit.story_text?.substring(0, 500) || ''
              );

              console.log(`[scan:hn:raw] "${hit.title}" — raw Claude response:`, result._raw);

              if (result.score >= MIN_SCORE) {
                await serviceClient.from('threads').insert({
                  user_id: user.id,
                  source: 'hn',
                  title: hit.title || 'Untitled',
                  url,
                  content_preview: (hit.story_text || '').substring(0, 300),
                  subreddit: null,
                  score: result.score,
                  urgency: result.urgency,
                  score_reason: result.reason,
                  reply_generated: false,
                  marked_done: false,
                  marked_contacted: false,
                });
                totalSaved++;
              }
            } catch (err) {
              console.error(`[scan:hn:error] Failed to score "${hit.title}":`, err);
              // Skip this thread and continue
            }
          }
        }
      } catch {
        // Skip failed HN requests
      }
    }

    console.log(
      `[scan] Found ${redditFound} Reddit threads, ${hnFound} HN threads. ${totalSaved} passed score threshold (>= ${MIN_SCORE}).`
    );

    // Update usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usageRow } = await serviceClient
      .from('usage')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (usageRow) {
      const lastScanDate = usageRow.last_scan_at
        ? new Date(usageRow.last_scan_at).toISOString().split('T')[0]
        : null;
      const scansToday =
        lastScanDate === today ? usageRow.scans_today + 1 : 1;

      await serviceClient
        .from('usage')
        .update({ scans_today: scansToday, last_scan_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else {
      await serviceClient.from('usage').insert({
        user_id: user.id,
        scans_today: 1,
        replies_this_month: 0,
        last_scan_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ saved: totalSaved });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Scan failed' },
      { status: 500 }
    );
  }
}
