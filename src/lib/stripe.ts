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
    scansPerDay: 50,
    repliesPerMonth: 50,
    features: [
      '50 scans per day',
      '50 AI reply generations per month',
      'Reddit & Hacker News monitoring',
      'AI buying intent scoring (0-100)',
      'AI reply generator with custom tone',
      'Product mention toggle',
      'Keyword AI generator',
      'Dashboard with filters & metrics',
    ],
  },
  pro: {
    name: 'Pro',
    price: 99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    scansPerDay: 500,
    repliesPerMonth: 500,
    features: [
      '500 scans per day',
      '500 AI reply generations per month',
      'Everything in Starter',
      'Higher daily scan volume',
      'Priority support',
      'Early access to new features',
      'Advanced keyword suggestions',
      'Unlimited keyword slots',
    ],
  },
};
