import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { generateReply } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId, title, content, productMention } = await request.json();

    const reply = await generateReply(title, content || '', productMention || undefined);

    // Mark reply as generated
    const serviceClient = createServiceClient();
    await serviceClient
      .from('threads')
      .update({ reply_generated: true })
      .eq('id', threadId)
      .eq('user_id', user.id);

    // Update usage
    const { data: usageRow } = await serviceClient
      .from('usage')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (usageRow) {
      await serviceClient
        .from('usage')
        .update({ replies_this_month: usageRow.replies_this_month + 1 })
        .eq('user_id', user.id);
    } else {
      await serviceClient.from('usage').insert({
        user_id: user.id,
        scans_today: 0,
        replies_this_month: 1,
        last_scan_at: null,
      });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Generate reply error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reply' },
      { status: 500 }
    );
  }
}
