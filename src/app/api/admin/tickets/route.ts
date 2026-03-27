import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const sc = createServiceClient();
  const { data } = await sc
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json({ tickets: data || [] });
}
