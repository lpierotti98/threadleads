import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description } = await request.json();

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system:
        'You are an expert at finding buying intent signals on Reddit and Hacker News. Based on this product/service description, generate exactly 10 search keywords that would find forum threads where people are actively looking to buy, try, or solve the problem this product addresses. Return ONLY a JSON array of 10 strings, no markdown, no explanation. Focus on pain-point phrases people actually type, not product category names.',
      messages: [
        {
          role: 'user',
          content: description.trim(),
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const keywords = JSON.parse(clean);

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('[generate-keywords] Error:', error);
    return NextResponse.json({ error: 'Failed to generate keywords' }, { status: 500 });
  }
}
