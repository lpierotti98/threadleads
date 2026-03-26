import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateReply } from '@/lib/claude';
import {
  authenticateAndAuthorize,
  checkReplyLimit,
  checkRateLimit,
  validateString,
  truncateForClaude,
  REPLY_LIMITS,
} from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
  try {
    // 1. Auth + subscription
    const authResult = await authenticateAndAuthorize();
    if (!authResult.ok) return authResult.response;
    const { auth } = authResult;

    // 2. Check reply limit BEFORE calling Claude
    const replyLimit = checkReplyLimit(auth);
    if (!replyLimit.allowed) {
      const limit = auth.plan ? REPLY_LIMITS[auth.plan] : 0;
      return NextResponse.json({
        error: 'REPLY_LIMIT_REACHED',
        message: auth.plan
          ? `You have used all ${limit} monthly replies (${auth.plan.charAt(0).toUpperCase() + auth.plan.slice(1)} plan). Resets on the 1st of next month.`
          : 'Active subscription required to generate replies.',
        repliesUsed: auth.usage.replies_this_month,
        repliesLimit: limit,
        upgradeTo: auth.plan === 'starter' ? 'pro' : null,
      }, { status: 429 });
    }

    // 3. Rate limit
    const rateLimit = checkRateLimit(auth.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason }, { status: 429 });
    }

    // 4. Validate input
    const body = await request.json();
    console.log('[generate-reply] Request body:', JSON.stringify(body, null, 2));

    const { threadId, title, content, productMention } = body;

    const titleCheck = validateString(threadId, 'threadId', 100);
    if (!titleCheck.valid) {
      return NextResponse.json({ error: titleCheck.error }, { status: 400 });
    }

    const titleVal = validateString(title, 'title', 500);
    if (!titleVal.valid) {
      return NextResponse.json({ error: titleVal.error }, { status: 400 });
    }

    // Product mention validation (optional)
    let sanitizedMention: string | undefined;
    if (productMention) {
      const pmCheck = validateString(productMention, 'productMention', 300);
      if (pmCheck.valid) sanitizedMention = pmCheck.value;
    }

    // 5. Call Claude with truncated content
    const reply = await generateReply(
      truncateForClaude(titleVal.value, 200),
      truncateForClaude(content || '', 500),
      sanitizedMention
    );

    // 6. Update database
    const serviceClient = createServiceClient();
    await serviceClient
      .from('threads')
      .update({ reply_generated: true })
      .eq('id', threadId)
      .eq('user_id', auth.userId);

    // 7. Increment usage
    const { data: usageRow } = await serviceClient
      .from('usage')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (usageRow) {
      await serviceClient
        .from('usage')
        .update({ replies_this_month: usageRow.replies_this_month + 1 })
        .eq('user_id', auth.userId);
    } else {
      await serviceClient.from('usage').insert({
        user_id: auth.userId,
        scans_today: 0,
        replies_this_month: 1,
        last_scan_at: null,
      });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Generate reply error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reply. Please try again.' },
      { status: 500 }
    );
  }
}
