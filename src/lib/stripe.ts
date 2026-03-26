import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    scansPerDay: 1,
    repliesPerMonth: 50,
    maxKeywords: 5,
    features: [
      '1 full scan per day',
      'Up to 5 keywords',
      '50 AI replies per month',
      'Reddit & Hacker News monitoring',
      'AI buying intent scoring (0-100)',
      'AI reply generator with custom tone',
      'Product mention toggle',
      'Keyword AI generator',
    ],
  },
  pro: {
    name: 'Pro',
    price: 99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    scansPerDay: 3,
    repliesPerMonth: 200,
    maxKeywords: 10,
    features: [
      '3 full scans per day',
      'Up to 10 keywords',
      '200 AI replies per month',
      'Everything in Starter',
      'Priority support',
      'Early access to new features',
      'Advanced keyword suggestions',
      'Dashboard with filters & metrics',
    ],
  },
};
