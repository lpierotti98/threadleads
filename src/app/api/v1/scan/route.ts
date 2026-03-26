import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { scoreThread } from '@/lib/claude';
import { authenticateApiKey } from '@/lib/api-auth';
import { SCAN_LIMITS } from '@/lib/auth-guard';

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
    const authResult = await authenticateApiKey(request);
    if (!authResult.ok) return authResult.response;
    const { auth } = authResult;

    // Check scan limit
    const max = SCAN_LIMITS[auth.plan!];
    if (auth.usage.scans_today >= max) {
      return NextResponse.json({
        error: 'SCAN_LIMIT_REACHED',
        message: `Daily scan limit reached (${max}/day).`,
        scansUsed: auth.usage.scans_today,
        scansLimit: max,
      }, { status: 429 });
    }

    const body = await request.json();
    const keywords: string[] = body.keywords;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'keywords must be a non-empty array of strings.' }, { status: 400 });
    }

    const activeKeywords = keywords
      .filter((k) => typeof k === 'string' && k.trim())
      .map((k) => k.trim().substring(0, 100))
      .slice(0, 5);

    if (activeKeywords.length === 0) {
      return NextResponse.json({ error: 'No valid keywords provided.' }, { status: 400 });
    }

    const days = ALLOWED_DAYS.includes(body.days) ? body.days : 7;
    const serviceClient = createServiceClient();
    const allThreads: Array<Record<string, unknown>> = [];

    for (const kw of activeKeywords) {
      const query = encodeURIComponent(kw);

      // Reddit RSS
      try {
        const redditUrl = `https://www.reddit.com/search.rss?q=${query}&sort=relevance&t=${redditTimeFilter(days)}&limit=25`;
        const redditRes = await fetch(redditUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ThreadLeads/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });
        await new Promise((r) => setTimeout(r, 1000));

        if (redditRes.ok) {
          const rssText = await redditRes.text();
          const entries = Array.from(rssText.matchAll(/<entry>([\s\S]*?)<\/entry>/g));
          const posts = entries.map((m) => {
            const e = m[1];
            const title = e.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
            const url = e.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] || '';
            const content = e.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]?.replace(/<[^>]+>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').substring(0, 500).trim() || '';
            const subreddit = url.match(/reddit\.com\/r\/([^/]+)/)?.[1] || '';
            return { title, url, content, subreddit };
          }).filter((p) => p.title && p.url);

          for (const post of posts) {
            const { data: existing } = await serviceClient.from('threads').select('id').eq('url', post.url).eq('user_id', auth.userId).maybeSingle();
            if (existing) continue;
            try {
              const result = await scoreThread(post.title.substring(0, 200), post.content.substring(0, 500));
              if (result.score >= MIN_SCORE) {
                const row = {
                  user_id: auth.userId, source: 'reddit' as const, title: post.title.substring(0, 500),
                  url: post.url.substring(0, 2000), content_preview: post.content.substring(0, 300),
                  subreddit: post.subreddit.substring(0, 100), score: result.score,
                  urgency: result.urgency, score_reason: result.reason?.substring(0, 500) || '',
                  reply_generated: false, marked_done: false, marked_contacted: false,
                };
                await serviceClient.from('threads').insert(row);
                allThreads.push({ title: row.title, url: row.url, source: row.source, subreddit: row.subreddit, score: row.score, urgency: row.urgency, score_reason: row.score_reason, created_at: new Date().toISOString() });
              }
            } catch { /* skip */ }
          }
        }
      } catch { /* skip */ }

      // HN
      const cutoff = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
      try {
        const hnRes = await fetch(`https://hn.algolia.com/api/v1/search?query=${query}&tags=ask_hn,show_hn&numericFilters=created_at_i>${cutoff}&hitsPerPage=25`);
        if (hnRes.ok) {
          const hnData = await hnRes.json();
          for (const hit of (hnData?.hits || [])) {
            const url = `https://news.ycombinator.com/item?id=${hit.objectID}`;
            const { data: existing } = await serviceClient.from('threads').select('id').eq('url', url).eq('user_id', auth.userId).maybeSingle();
            if (existing) continue;
            try {
              const result = await scoreThread((hit.title || '').substring(0, 200), (hit.story_text || '').substring(0, 500));
              if (result.score >= MIN_SCORE) {
                const row = {
                  user_id: auth.userId, source: 'hn' as const, title: (hit.title || 'Untitled').substring(0, 500),
                  url, content_preview: (hit.story_text || '').substring(0, 300), subreddit: null,
                  score: result.score, urgency: result.urgency, score_reason: result.reason?.substring(0, 500) || '',
                  reply_generated: false, marked_done: false, marked_contacted: false,
                };
                await serviceClient.from('threads').insert(row);
                allThreads.push({ title: row.title, url: row.url, source: row.source, subreddit: null, score: row.score, urgency: row.urgency, score_reason: row.score_reason, created_at: new Date().toISOString() });
              }
            } catch { /* skip */ }
          }
        }
      } catch { /* skip */ }
    }

    // Update usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usageRow } = await serviceClient.from('usage').select('*').eq('user_id', auth.userId).maybeSingle();
    if (usageRow) {
      const isNewDay = usageRow.last_scan_at ? new Date(usageRow.last_scan_at).toISOString().split('T')[0] !== today : true;
      await serviceClient.from('usage').update({ scans_today: isNewDay ? 1 : usageRow.scans_today + 1, last_scan_at: new Date().toISOString() }).eq('user_id', auth.userId);
    } else {
      await serviceClient.from('usage').insert({ user_id: auth.userId, scans_today: 1, replies_this_month: 0, last_scan_at: new Date().toISOString() });
    }

    return NextResponse.json({ threads: allThreads });
  } catch (error) {
    console.error('[api/v1/scan] Error:', error);
    return NextResponse.json({ error: 'Scan failed.' }, { status: 500 });
  }
}
