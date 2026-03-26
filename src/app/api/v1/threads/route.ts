import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { authenticateApiKey } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (!authResult.ok) return authResult.response;
    const { auth } = authResult;

    const url = new URL(request.url);
    const minScore = Math.max(0, Math.min(100, parseInt(url.searchParams.get('min_score') || '0', 10) || 0));
    const source = url.searchParams.get('source');
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '20', 10) || 20));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);

    const supabase = createServiceClient();

    let query = supabase
      .from('threads')
      .select('id, title, url, source, subreddit, score, urgency, score_reason, reply_generated, marked_done, marked_contacted, created_at', { count: 'exact' })
      .eq('user_id', auth.userId)
      .gte('score', minScore)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (source === 'reddit' || source === 'hn') {
      query = query.eq('source', source);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('[api/v1/threads] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch threads.' }, { status: 500 });
    }

    return NextResponse.json({
      threads: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[api/v1/threads] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
