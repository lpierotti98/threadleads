import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { scoreThread } from '@/lib/claude';
import {
  authenticateAndAuthorize,
  checkScanLimit,
  checkRateLimit,
  truncateForClaude,
  SCAN_LIMITS,
} from '@/lib/auth-guard';

function redditTimeFilter(days: number): string {
  if (days <= 1) return 'day';
  if (days <= 7) return 'week';
  if (days <= 30) return 'month';
  return 'year';
}

const ALLOWED_DAYS = [1, 7, 30, 90];
const MIN_SCORE = 40;

export async function POST(request: NextRequest) {
  try {
    // 1. Auth + subscription check
    const authResult = await authenticateAndAuthorize();
    if (!authResult.ok) return authResult.response;
    const { auth } = authResult;

    // 2. Check scan limit BEFORE starting (never interrupt mid-scan)
    const scanLimit = checkScanLimit(auth);
    if (!scanLimit.allowed) {
      const limit = auth.plan ? SCAN_LIMITS[auth.plan] : 0;
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      return NextResponse.json({
        error: 'SCAN_LIMIT_REACHED',
        message: auth.plan
          ? `You have used your ${limit === 1 ? '1 daily scan' : `${limit} daily scans`} (${auth.plan.charAt(0).toUpperCase() + auth.plan.slice(1)} plan). Resets at midnight UTC.`
          : 'Active subscription required to scan.',
        scansUsed: auth.usage.scans_today,
        scansLimit: limit,
        resetsAt: tomorrow.toISOString(),
        upgradeTo: auth.plan === 'starter' ? 'pro' : null,
      }, { status: 429 });
    }

    // 3. Rate limit
    const rateLimit = checkRateLimit(auth.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason }, { status: 429 });
    }

    // 4. Validate input
    const body = await request.json().catch(() => ({}));
    const days = ALLOWED_DAYS.includes(body.days) ? body.days : 7;

    const serviceClient = createServiceClient();

    // Get user keywords
    const { data: settings } = await serviceClient
      .from('users_settings')
      .select('keywords')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const keywords = (settings?.keywords || []).filter(
      (k: { text: string; active: boolean }) => k.active
    );

    if (keywords.length === 0) {
      return NextResponse.json({ error: 'No active keywords.' }, { status: 400 });
    }

    // Enforce keyword cap per plan server-side
    const maxKw = auth.plan === 'starter' ? 5 : 10;
    const activeKeywords = keywords.slice(0, maxKw);

    console.log(`[scan] Starting scan for ${activeKeywords.length} keyword(s): ${activeKeywords.map((k: { text: string }) => k.text).join(', ')}`);

    let totalSaved = 0;
    let redditFound = 0;
    let hnFound = 0;
    let threadsScored = 0;

    for (const kw of activeKeywords) {
      const query = encodeURIComponent(kw.text.substring(0, 100));

      // Search Reddit via RSS
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

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (redditRes.status !== 200) {
          const errText = await redditRes.text();
          console.log(`[scan:reddit] Error response:`, errText.substring(0, 200));
        } else {
          const rssText = await redditRes.text();
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

          for (const post of posts) {
            const { data: existing } = await serviceClient
              .from('threads')
              .select('id')
              .eq('url', post.url)
              .eq('user_id', auth.userId)
              .maybeSingle();

            if (existing) continue;

            try {
              const result = await scoreThread(
                truncateForClaude(post.title, 200),
                truncateForClaude(post.content)
              );

              threadsScored++;
              console.log(`[scan:reddit] "${post.title.substring(0, 60)}" — score: ${result.score}`);

              if (result.score >= MIN_SCORE) {
                await serviceClient.from('threads').insert({
                  user_id: auth.userId,
                  source: 'reddit',
                  title: post.title.substring(0, 500),
                  url: post.url.substring(0, 2000),
                  content_preview: post.content.substring(0, 300),
                  subreddit: post.subreddit.substring(0, 100),
                  score: result.score,
                  urgency: result.urgency,
                  score_reason: result.reason?.substring(0, 500) || '',
                  reply_generated: false,
                  marked_done: false,
                  marked_contacted: false,
                });
                totalSaved++;
              }
            } catch (err) {
              console.error(`[scan:reddit:error] Failed to score "${post.title.substring(0, 60)}":`, err);
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
          const errText = await hnRes.text();
          console.log(`[scan:hn] Error response:`, errText.substring(0, 200));
        } else {
          const hnData = await hnRes.json();
          const hits = hnData?.hits || [];
          hnFound += hits.length;

          for (const hit of hits) {
            const url = `https://news.ycombinator.com/item?id=${hit.objectID}`;

            const { data: existing } = await serviceClient
              .from('threads')
              .select('id')
              .eq('url', url)
              .eq('user_id', auth.userId)
              .maybeSingle();

            if (existing) continue;

            try {
              const result = await scoreThread(
                truncateForClaude(hit.title || '', 200),
                truncateForClaude(hit.story_text || '')
              );

              threadsScored++;

              if (result.score >= MIN_SCORE) {
                await serviceClient.from('threads').insert({
                  user_id: auth.userId,
                  source: 'hn',
                  title: (hit.title || 'Untitled').substring(0, 500),
                  url,
                  content_preview: (hit.story_text || '').substring(0, 300),
                  subreddit: null,
                  score: result.score,
                  urgency: result.urgency,
                  score_reason: result.reason?.substring(0, 500) || '',
                  reply_generated: false,
                  marked_done: false,
                  marked_contacted: false,
                });
                totalSaved++;
              }
            } catch (err) {
              console.error(`[scan:hn:error] Failed to score "${hit.title}":`, err);
            }
          }
        }
      } catch {
        // Skip failed HN requests
      }
    }

    console.log(`[scan] Scored ${threadsScored} threads. Found ${redditFound} Reddit, ${hnFound} HN. ${totalSaved} saved (>= ${MIN_SCORE}).`);

    // Increment scan count ONLY after successful completion
    const today = new Date().toISOString().split('T')[0];
    const { data: usageRow } = await serviceClient
      .from('usage')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (usageRow) {
      const lastScanDate = usageRow.last_scan_at
        ? new Date(usageRow.last_scan_at).toISOString().split('T')[0]
        : null;
      const isNewDay = lastScanDate !== today;

      await serviceClient
        .from('usage')
        .update({
          scans_today: isNewDay ? 1 : usageRow.scans_today + 1,
          last_scan_at: new Date().toISOString(),
        })
        .eq('user_id', auth.userId);
    } else {
      await serviceClient.from('usage').insert({
        user_id: auth.userId,
        scans_today: 1,
        replies_this_month: 0,
        last_scan_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ saved: totalSaved, scored: threadsScored });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
