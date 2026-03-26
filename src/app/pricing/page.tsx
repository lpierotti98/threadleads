'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const plans = [
  {
    name: 'Starter',
    price: 199,
    planKey: 'starter',
    features: [
      '500 scans per day',
      '50 reply generations per month',
      'Reddit & Hacker News monitoring',
      'AI buying intent scoring',
      'AI reply generation',
    ],
  },
  {
    name: 'Pro',
    price: 399,
    planKey: 'pro',
    popular: true,
    features: [
      'Unlimited scans',
      'Unlimited reply generations',
      'Reddit & Hacker News monitoring',
      'AI buying intent scoring',
      'AI reply generation',
      'Priority support',
    ],
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      setCurrentPlan(data?.plan || null);
    }
    fetchPlan();
  }, [supabase]);

  async function handleCheckout(planKey: string) {
    setLoading(planKey);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold">
            Thread<span className="text-indigo-600">Leads</span>
          </Link>
          <h2 className="text-3xl font-bold mt-6">
            Turn forum conversations into leads
          </h2>
          <p className="text-gray-500 mt-2">
            Choose the plan that fits your outreach volume
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.planKey;
            return (
              <div
                key={plan.planKey}
                className={`bg-white rounded-2xl border-2 p-8 relative ${
                  isCurrent
                    ? 'border-emerald-500 shadow-lg'
                    : plan.popular
                      ? 'border-indigo-600 shadow-lg'
                      : 'border-gray-200'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Check size={12} strokeWidth={3} />
                    Your current plan
                  </span>
                )}
                {!isCurrent && plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check
                        size={16}
                        className="text-emerald-500 flex-shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full mt-8 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.planKey)}
                    disabled={loading === plan.planKey}
                    className={`w-full mt-8 py-3 rounded-xl font-semibold text-sm transition-colors ${
                      plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {loading === plan.planKey
                      ? 'Redirecting...'
                      : `Get ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
