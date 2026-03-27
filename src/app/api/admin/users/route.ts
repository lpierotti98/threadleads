import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const sc = createServiceClient();

  // Get subscriptions and usage keyed by user_id
  const [subsRes, usageRes] = await Promise.all([
    sc.from('subscriptions').select('user_id, plan, status'),
    sc.from('usage').select('user_id, scans_today, replies_this_month'),
  ]);

  const subsByUser = new Map((subsRes.data || []).map((s) => [s.user_id, s]));
  const usageByUser = new Map((usageRes.data || []).map((u) => [u.user_id, u]));

  // List auth users via admin API
  const { data: authData, error } = await sc.auth.admin.listUsers({ page, perPage: limit });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let users = (authData?.users || []).map((u) => {
    const sub = subsByUser.get(u.id);
    const usage = usageByUser.get(u.id);
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      plan: sub?.status === 'active' ? sub.plan : null,
      scans_today: usage?.scans_today || 0,
      replies_this_month: usage?.replies_this_month || 0,
    };
  });

  if (search) {
    users = users.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));
  }

  return NextResponse.json({ users, page, limit, offset });
}
