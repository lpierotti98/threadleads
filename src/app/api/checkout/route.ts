import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

const VALID_PLANS = ['starter', 'pro'] as const;
const PRICES: Record<string, number> = { starter: 4900, pro: 9900 };

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be "starter" or "pro".' }, { status: 400 });
    }

    const priceAmount = PRICES[plan];

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ThreadLeads ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
              description:
                plan === 'starter'
                  ? '$49/mo — 1 scan/day, 5 keywords, 50 replies/month'
                  : '$99/mo — 3 scans/day, 10 keywords, 200 replies/month',
            },
            unit_amount: priceAmount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
