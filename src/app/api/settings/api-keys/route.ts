import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { generateApiKey } from '@/lib/api-keys';

const MAX_KEYS = 3;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createServiceClient();
  const { data } = await serviceClient
    .from('api_keys')
    .select('id, name, last_used_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ keys: data || [] });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createServiceClient();

  // Check count
  const { count } = await serviceClient
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= MAX_KEYS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_KEYS} API keys allowed.` },
      { status: 400 }
    );
  }

  const key = generateApiKey();

  const { error } = await serviceClient.from('api_keys').insert({
    user_id: user.id,
    key,
    name: `Key ${(count || 0) + 1}`,
  });

  if (error) {
    console.error('[api-keys] Insert error:', error);
    return NextResponse.json({ error: 'Failed to create API key.' }, { status: 500 });
  }

  return NextResponse.json({ key });
}
