'use client';

import { useEffect, useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const plans = [
  { name: 'Starter', price: 199, planKey: 'starter', desc: '500 scans/day, 50 replies/month', features: ['500 scans per day', '50 reply generations per month', 'Reddit & Hacker News', 'AI intent scoring', 'AI reply generation'] },
  { name: 'Pro', price: 399, planKey: 'pro', popular: true, desc: 'Unlimited everything', features: ['Unlimited scans', 'Unlimited replies', 'Reddit & Hacker News', 'AI intent scoring', 'AI reply generation', 'Priority support'] },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).eq('status', 'active').maybeSingle();
      setCurrentPlan(data?.plan || null);
    }
    fetchPlan();
  }, [supabase]);

  async function handleCheckout(planKey: string) {
    setLoading(planKey);
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planKey }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setLoading(null); }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 border flex items-center justify-center" style={{ borderColor: 'var(--accent)' }}>
              <span className="font-mono text-xs font-bold" style={{ color: 'var(--accent)' }}>TL</span>
            </div>
            <span className="font-serif text-base" style={{ color: 'var(--text)' }}>ThreadLeads</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={13} /> dashboard
          </Link>
        </div>
      </div>

      <div className="pt-16 pb-12 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-secondary)' }}>Pricing</p>
        <h1 className="font-serif text-4xl" style={{ color: 'var(--text)' }}>Choose your plan</h1>
        <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Turn forum conversations into qualified leads. Cancel anytime.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.planKey;
            return (
              <div key={plan.planKey} className="p-8 relative border card-hover" style={{ background: 'var(--surface)', borderColor: isCurrent ? 'var(--green)' : plan.popular ? 'var(--accent)' : 'var(--border)' }}>
                {isCurrent && <span className="absolute top-4 right-4 font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-1" style={{ background: 'var(--green)', color: '#0e0e0f' }}>Current</span>}
                {!isCurrent && plan.popular && <span className="absolute top-4 right-4 font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-1" style={{ background: 'var(--accent)', color: 'white' }}>Popular</span>}
                <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{plan.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-5xl" style={{ color: 'var(--text)' }}>${plan.price}</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>/mo</span>
                </div>
                <p className="font-mono text-[11px] mt-2" style={{ color: 'var(--text-secondary)' }}>{plan.desc}</p>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check size={13} style={{ color: 'var(--green)' }} /> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button disabled className="w-full mt-8 py-3 font-mono text-xs font-bold uppercase tracking-wider border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>current plan</button>
                ) : (
                  <button onClick={() => handleCheckout(plan.planKey)} disabled={loading === plan.planKey} className="w-full mt-8 py-3 font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors" style={{ background: 'var(--accent)', color: 'white' }}>
                    {loading === plan.planKey ? 'redirecting...' : `get ${plan.name.toLowerCase()}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>ThreadLeads &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-6 font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/dashboard" className="hover:underline underline-offset-2">dashboard</Link>
            <Link href="/settings" className="hover:underline underline-offset-2">settings</Link>
            <Link href="/login" className="hover:underline underline-offset-2">sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
