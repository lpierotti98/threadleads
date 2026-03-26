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
    price: 199,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    scansPerDay: 50,
    repliesPerMonth: 50,
    features: [
      '50 scans per day',
      '50 reply generations per month',
      'Reddit & Hacker News monitoring',
      'AI buying intent scoring',
      'AI reply generation',
    ],
  },
  pro: {
    name: 'Pro',
    price: 399,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    scansPerDay: 500,
    repliesPerMonth: 500,
    features: [
      '500 scans per day',
      '500 reply generations per month',
      'Reddit & Hacker News monitoring',
      'AI buying intent scoring',
      'AI reply generation',
      'Priority support',
    ],
  },
};
