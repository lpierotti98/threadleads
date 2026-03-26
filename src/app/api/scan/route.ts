import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { scoreThread } from '@/lib/claude';

function redditTimeFilter(days: number): string {
  if (days <= 1) return 'day';
  if (days <= 7) return 'week';
  if (days <= 30) return 'month';
  return 'year';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const days = typeof body.days === 'number' && body.days > 0 ? body.days : 7;

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

    console.log(`[scan] Starting scan for ${keywords.length} keyword(s): ${keywords.map((k: { text: string }) => k.text).join(', ')}`);

    const MIN_SCORE = 20; // TODO: restore to 40+ after testing
    let totalSaved = 0;
    let redditFound = 0;
    let hnFound = 0;

    for (const kw of keywords) {
      const query = encodeURIComponent(kw.text);

      // Search Reddit via public RSS feed
      try {
        const redditUrl = `https://www.reddit.com/search.rss?q=${query}&sort=relevance&t=${redditTimeFilter(days)}&limit=25`;
        const redditRes = await fetch(redditUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ThreadLeads/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });

        console.log(`[scan:reddit] URL: ${redditUrl}`);
        console.log(`[scan:reddit] Status: ${redditRes.status}`);

        // Rate limit: wait 1s between Reddit requests
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (redditRes.status !== 200) {
          const errText = await redditRes.text();
          console.log(`[scan:reddit] Error response:`, errText.substring(0, 200));
        } else {
          const rssText = await redditRes.text();

          // Parse RSS XML entries
          const entries = Array.from(rssText.matchAll(/<entry>([\s\S]*?)<\/entry>/g));
          const posts = entries.map(match => {
            const entry = match[1];
            const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
            const entryUrl = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] || '';
            const content = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]?.replace(/<[^>]+>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').substring(0, 500).trim() || '';
            const subreddit = entryUrl.match(/reddit\.com\/r\/([^/]+)/)?.[1] || '';
            return { title, url: entryUrl, content, subreddit };
          }).filter(p => p.title && p.url);

          redditFound += posts.length;
          console.log(`[scan:reddit] Found ${posts.length} posts for "${kw.text}"`);

          // Log first 3 titles to confirm real data
          const preview = posts.slice(0, 3).map(p => p.title);
          console.log(`[scan:reddit] First ${preview.length} titles:`, preview);

          for (const post of posts) {
            // Check for duplicate
            const { data: existing } = await serviceClient
              .from('threads')
              .select('id')
              .eq('url', post.url)
              .eq('user_id', user.id)
              .maybeSingle();

            if (existing) continue;

            // Score with Claude
            try {
              const result = await scoreThread(post.title, post.content);

              console.log(`[scan:reddit:raw] "${post.title}" — raw Claude response:`, result._raw);
              console.log(`[scan:reddit] "${post.title}" — score: ${result.score}, urgency: ${result.urgency}`);

              if (result.score >= MIN_SCORE) {
                await serviceClient.from('threads').insert({
                  user_id: user.id,
                  source: 'reddit',
                  title: post.title,
                  url: post.url,
                  content_preview: post.content.substring(0, 300),
                  subreddit: post.subreddit,
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
              console.error(`[scan:reddit:error] Failed to score "${post.title}":`, err);
              // Skip this thread and continue
            }
          }
        }
      } catch {
        // Skip failed Reddit requests
      }

      // Search Hacker News
      const cutoff = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
      const hnUrl = `https://hn.algolia.com/api/v1/search?query=${query}&tags=ask_hn,show_hn&numericFilters=created_at_i>${cutoff}&hitsPerPage=25`;
      try {
        const hnRes = await fetch(hnUrl);

        console.log(`[scan:hn] URL: ${hnUrl}`);
        console.log(`[scan:hn] Status: ${hnRes.status}`);
        if (hnRes.status !== 200) {
          console.log(`[scan:hn] Error response:`, await hnRes.text());
        }

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
