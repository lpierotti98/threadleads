import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/stripe';

interface ApiAuthResult {
  userId: string;
  keyId: string;
  plan: 'starter' | 'pro' | null;
  usage: { scans_today: number; replies_this_month: number };
}

const API_RATE_MAP = new Map<string, number[]>();
const API_RATE_LIMITS: Record<string, number> = { starter: 10, pro: 30 };

export async function authenticateApiKey(
  request: NextRequest
): Promise<{ ok: true; auth: ApiAuthResult } | { ok: false; response: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY' },
        { status: 401 }
      ),
    };
  }

  const key = authHeader.slice(7).trim();
  if (!key || !key.startsWith('tl_live_')) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid API key format.' }, { status: 401 }),
    };
  }

  const supabase = createServiceClient();

  const { data: apiKey } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key', key)
    .maybeSingle();

  if (!apiKey) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid API key.' }, { status: 401 }),
    };
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKey.id);

  // Get subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', apiKey.user_id)
    .eq('status', 'active')
    .maybeSingle();

  const plan = (sub?.plan as 'starter' | 'pro') || null;

  if (!plan) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Active subscription required to use the API.' },
        { status: 403 }
      ),
    };
  }

  // Rate limit per minute
  const now = Date.now();
  const timestamps = API_RATE_MAP.get(apiKey.user_id) || [];
  const recent = timestamps.filter((t) => now - t < 60_000);
  const max = API_RATE_LIMITS[plan] || 10;

  if (recent.length >= max) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `API rate limit exceeded. Max ${max} requests per minute on ${PLANS[plan].name} plan.` },
        { status: 429 }
      ),
    };
  }
  recent.push(now);
  API_RATE_MAP.set(apiKey.user_id, recent);

  // Get usage
  const { data: usageRow } = await supabase
    .from('usage')
    .select('scans_today, replies_this_month, last_scan_at')
    .eq('user_id', apiKey.user_id)
    .maybeSingle();

  let scansToday = usageRow?.scans_today || 0;
  if (usageRow?.last_scan_at) {
    const lastDate = new Date(usageRow.last_scan_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (lastDate !== today) scansToday = 0;
  }

  return {
    ok: true,
    auth: {
      userId: apiKey.user_id,
      keyId: apiKey.id,
      plan,
      usage: {
        scans_today: scansToday,
        replies_this_month: usageRow?.replies_this_month || 0,
      },
    },
  };
}
