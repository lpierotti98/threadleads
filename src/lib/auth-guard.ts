import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/stripe';

export interface AuthResult {
  userId: string;
  email: string;
  plan: 'starter' | 'pro' | null;
  usage: {
    scans_today: number;
    replies_this_month: number;
  };
}

interface LimitResult {
  allowed: boolean;
  reason?: string;
}

// Rate limit store: userId -> { timestamps[] }
const rateLimitMap = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

export function checkRateLimit(userId: string): LimitResult {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    return { allowed: false, reason: 'Rate limit exceeded. Max 10 AI requests per minute.' };
  }

  recent.push(now);
  rateLimitMap.set(userId, recent);
  return { allowed: true };
}

export async function authenticateAndAuthorize(): Promise<
  { ok: true; auth: AuthResult } | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const serviceClient = createServiceClient();

  const { data: sub } = await serviceClient
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  const plan = (sub?.plan as 'starter' | 'pro') || null;

  const { data: usageRow } = await serviceClient
    .from('usage')
    .select('scans_today, replies_this_month, last_scan_at')
    .eq('user_id', user.id)
    .maybeSingle();

  // Reset daily counters if last scan was a different day
  let scansToday = usageRow?.scans_today || 0;
  if (usageRow?.last_scan_at) {
    const lastDate = new Date(usageRow.last_scan_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (lastDate !== today) scansToday = 0;
  }

  return {
    ok: true,
    auth: {
      userId: user.id,
      email: user.email || '',
      plan,
      usage: {
        scans_today: scansToday,
        replies_this_month: usageRow?.replies_this_month || 0,
      },
    },
  };
}

const SCAN_LIMITS: Record<string, number> = { starter: 1, pro: 3 };
const REPLY_LIMITS: Record<string, number> = { starter: 50, pro: 200 };
const KEYWORD_LIMITS: Record<string, number> = { starter: 5, pro: 10 };

export function checkScanLimit(auth: AuthResult): LimitResult {
  if (!auth.plan) {
    return { allowed: false, reason: 'Active subscription required to scan.' };
  }

  const max = SCAN_LIMITS[auth.plan];
  if (auth.usage.scans_today >= max) {
    return {
      allowed: false,
      reason: `Daily scan limit reached (${max}/day on ${PLANS[auth.plan].name} plan).`,
    };
  }

  return { allowed: true };
}

export function checkReplyLimit(auth: AuthResult): LimitResult {
  if (!auth.plan) {
    return { allowed: false, reason: 'Active subscription required to generate replies.' };
  }

  const max = REPLY_LIMITS[auth.plan];
  if (auth.usage.replies_this_month >= max) {
    return {
      allowed: false,
      reason: `Monthly reply limit reached (${max}/month on ${PLANS[auth.plan].name} plan).`,
    };
  }

  return { allowed: true };
}

export function checkKeywordGenLimit(auth: AuthResult): LimitResult {
  if (!auth.plan) {
    return { allowed: false, reason: 'Active subscription required to generate keywords.' };
  }
  return { allowed: true };
}

export function getMaxKeywords(plan: 'starter' | 'pro' | null): number {
  if (!plan) return 0;
  return KEYWORD_LIMITS[plan];
}

/** Truncate content to max chars for Claude API cost protection */
export function truncateForClaude(text: string, maxChars = 500): string {
  if (!text) return '';
  return text.substring(0, maxChars);
}

/** Validate string input */
export function validateString(
  value: unknown,
  fieldName: string,
  maxLength = 1000
): { valid: true; value: string } | { valid: false; error: string } {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return { valid: false, error: `${fieldName} is required.` };
  }
  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} exceeds maximum length of ${maxLength}.` };
  }
  return { valid: true, value: value.trim() };
}
