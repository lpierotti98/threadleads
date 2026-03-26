'use client';

import { useEffect, useState } from 'react';
import { Check, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const plans = [
  {
    name: 'Starter',
    price: 199,
    planKey: 'starter',
    description: 'For teams getting started with forum lead gen',
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
    description: 'For power users who want unlimited access',
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0f172a] border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Thread<span className="text-indigo-400">Leads</span>
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[#0f172a] pb-20 pt-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-white">
            Choose your plan
          </h1>
          <p className="text-slate-400 mt-3 text-lg max-w-xl mx-auto">
            Start turning forum conversations into qualified leads.
            Cancel anytime.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto px-6 -mt-12">
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.planKey;
            return (
              <div
                key={plan.planKey}
                className={`bg-white rounded-2xl p-8 relative shadow-xl shadow-gray-200/50 border-2 transition-all ${
                  isCurrent
                    ? 'border-emerald-400'
                    : plan.popular
                      ? 'border-indigo-600'
                      : 'border-gray-100'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                    <Check size={11} strokeWidth={3} />
                    Your current plan
                  </span>
                )}
                {!isCurrent && plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-400 font-medium">/month</span>
                </div>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-gray-600"
                    >
                      <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-emerald-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full mt-8 py-3.5 rounded-xl font-semibold text-sm bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.planKey)}
                    disabled={loading === plan.planKey}
                    className={`w-full mt-8 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25'
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/25'
                    } disabled:opacity-50`}
                  >
                    {loading === plan.planKey
                      ? 'Redirecting...'
                      : `Get started with ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-16 mt-12">
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              Thread<span className="text-indigo-600">Leads</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/settings" className="hover:text-gray-900 transition-colors">
              Settings
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} ThreadLeads
          </p>
        </div>
      </footer>
    </div>
  );
}
