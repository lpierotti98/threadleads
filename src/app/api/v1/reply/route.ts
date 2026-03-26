import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateReply } from '@/lib/claude';
import { authenticateApiKey } from '@/lib/api-auth';
import { REPLY_LIMITS } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (!authResult.ok) return authResult.response;
    const { auth } = authResult;

    // Check reply limit
    const max = REPLY_LIMITS[auth.plan!];
    if (auth.usage.replies_this_month >= max) {
      return NextResponse.json({
        error: 'REPLY_LIMIT_REACHED',
        message: `Monthly reply limit reached (${max}/month).`,
        repliesUsed: auth.usage.replies_this_month,
        repliesLimit: max,
      }, { status: 429 });
    }

    const body = await request.json();
    const { title, content, product_mention } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'title is required.' }, { status: 400 });
    }

    if (title.length > 500) {
      return NextResponse.json({ error: 'title exceeds 500 characters.' }, { status: 400 });
    }

    const reply = await generateReply(
      title.trim().substring(0, 200),
      (typeof content === 'string' ? content : '').substring(0, 500),
      typeof product_mention === 'string' ? product_mention.substring(0, 300) : undefined
    );

    // Update usage
    const supabase = createServiceClient();
    const { data: usageRow } = await supabase.from('usage').select('*').eq('user_id', auth.userId).maybeSingle();
    if (usageRow) {
      await supabase.from('usage').update({ replies_this_month: usageRow.replies_this_month + 1 }).eq('user_id', auth.userId);
    } else {
      await supabase.from('usage').insert({ user_id: auth.userId, scans_today: 0, replies_this_month: 1, last_scan_at: null });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[api/v1/reply] Error:', error);
    return NextResponse.json({ error: 'Failed to generate reply.' }, { status: 500 });
  }
}
