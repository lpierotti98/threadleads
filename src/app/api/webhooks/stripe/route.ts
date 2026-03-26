import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[stripe:webhook] Received event: ${event.type}`);

  const supabase = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      console.log('[stripe:webhook] Handling event: checkout.session.completed');
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        const { error } = await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            plan,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          },
          { onConflict: 'user_id' }
        );
        if (error) console.error('[stripe:webhook] Supabase upsert error:', error);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      console.log('[stripe:webhook] Handling event: customer.subscription.deleted');
      const subscription = event.data.object as Stripe.Subscription;
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);
      if (error) console.error('[stripe:webhook] Supabase update error:', error);
      break;
    }

    case 'customer.subscription.updated': {
      console.log('[stripe:webhook] Handling event: customer.subscription.updated');
      const subscription = event.data.object as Stripe.Subscription;
      const status = subscription.status === 'active' ? 'active' : 'canceled';
      const { error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('stripe_subscription_id', subscription.id);
      if (error) console.error('[stripe:webhook] Supabase update error:', error);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
