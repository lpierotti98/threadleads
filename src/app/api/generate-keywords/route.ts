import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  authenticateAndAuthorize,
  checkKeywordGenLimit,
  checkRateLimit,
  getMaxKeywords,
  validateString,
} from '@/lib/auth-guard';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth + subscription
    const authResult = await authenticateAndAuthorize();
    if (!authResult.ok) return authResult.response;
    const { auth } = authResult;

    // 2. Check subscription
    const limit = checkKeywordGenLimit(auth);
    if (!limit.allowed) {
      return NextResponse.json({ error: limit.reason }, { status: 429 });
    }

    // 3. Rate limit
    const rateLimit = checkRateLimit(auth.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason }, { status: 429 });
    }

    // 4. Check current keyword count against plan limit
    const maxKeywords = getMaxKeywords(auth.plan);
    const serviceClient = createServiceClient();
    const { data: settings } = await serviceClient
      .from('users_settings')
      .select('keywords')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const currentCount = (settings?.keywords || []).length;
    if (currentCount >= maxKeywords) {
      return NextResponse.json(
        { error: `Keyword limit reached for your plan (${maxKeywords} keywords on ${auth.plan} plan).` },
        { status: 429 }
      );
    }

    // 5. Validate input
    const body = await request.json();
    const descCheck = validateString(body.description, 'description', 500);
    if (!descCheck.valid) {
      return NextResponse.json({ error: descCheck.error }, { status: 400 });
    }

    // 6. Call Claude
    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system:
        'You are an expert at finding buying intent signals on Reddit and Hacker News. Based on this product/service description, generate exactly 10 search keywords that would find forum threads where people are actively looking to buy, try, or solve the problem this product addresses. Return ONLY a JSON array of 10 strings, no markdown, no explanation. Focus on pain-point phrases people actually type, not product category names.',
      messages: [
        { role: 'user', content: descCheck.value.substring(0, 500) },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const keywords = JSON.parse(clean);

    if (!Array.isArray(keywords)) {
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 500 });
    }

    return NextResponse.json({ keywords: keywords.slice(0, 10) });
  } catch (error) {
    console.error('[generate-keywords] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate keywords. Please try again.' },
      { status: 500 }
    );
  }
}
