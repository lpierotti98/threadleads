import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const sc = createServiceClient();

  const [subs, tickets, apiKeys] = await Promise.all([
    sc.from('subscriptions').select('plan, status'),
    sc.from('support_tickets').select('id', { count: 'exact', head: true }),
    sc.from('api_keys').select('id', { count: 'exact', head: true }),
  ]);

  const activeSubs = (subs.data || []).filter((s) => s.status === 'active');
  const starterCount = activeSubs.filter((s) => s.plan === 'starter').length;
  const proCount = activeSubs.filter((s) => s.plan === 'pro').length;
  const revenue = starterCount * 49 + proCount * 99;

  return NextResponse.json({
    activeSubscriptions: activeSubs.length,
    starterCount,
    proCount,
    totalTickets: tickets.count || 0,
    totalApiKeys: apiKeys.count || 0,
    monthlyRevenue: revenue,
  });
}
