import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    const prices: Record<string, number> = {
      starter: 19900,
      pro: 39900,
    };

    const priceAmount = prices[plan];
    if (!priceAmount) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

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
                  ? '500 scans/day, 50 replies/month'
                  : 'Unlimited scans and replies',
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
