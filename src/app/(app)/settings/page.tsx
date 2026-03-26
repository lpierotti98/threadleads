'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function SettingsPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [usage, setUsage] = useState({ scans_today: 0, replies_this_month: 0 });
  const [productMention, setProductMention] = useState('');
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      setPlan(sub?.plan || null);

      const { data: settings } = await supabase
        .from('users_settings')
        .select('product_mention')
        .eq('user_id', user.id)
        .maybeSingle();
      if (settings?.product_mention) setProductMention(settings.product_mention);

      const { data: u } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (u) setUsage(u);
    }
    load();
  }, [supabase]);

  async function handleSaveProductMention() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('users_settings')
      .upsert({ user_id: user.id, product_mention: productMention.trim() || null }, { onConflict: 'user_id' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>
          Settings
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Account, subscription, and preferences
        </p>
      </div>

      {/* Account */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Account
        </p>
        <div className="border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            email
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{email}</p>
        </div>
      </section>

      {/* Subscription */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Subscription
        </p>
        <div className="border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {plan ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                    {plan} Plan
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5" style={{ background: 'var(--green)', color: '#0e0e0f' }}>
                    Active
                  </span>
                </div>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {plan === 'starter' ? '$199/month' : '$399/month'}
                </p>
              </div>
              <Link href="/pricing" className="font-mono text-xs underline underline-offset-2" style={{ color: 'var(--accent)' }}>
                manage
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No active plan</p>
              <Link
                href="/pricing"
                className="font-mono text-xs font-bold uppercase tracking-wider px-4 py-2"
                style={{ background: 'var(--accent)', color: '#0e0e0f' }}
              >
                view plans
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Product Mention */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Product Mention
        </p>
        <div className="border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Included at the end of AI replies when the toggle is enabled.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={productMention}
              onChange={(e) => setProductMention(e.target.value)}
              placeholder="e.g. Acme (acme.com) - helps sales teams automate outreach"
              className="flex-1 border px-4 py-2.5 text-sm"
              style={{ background: 'var(--surface-el)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={handleSaveProductMention}
              className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 flex items-center gap-1.5"
              style={{ background: 'var(--accent)', color: '#0e0e0f' }}
            >
              {saved ? <><Check size={13} /> saved</> : 'save'}
            </button>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Usage
        </p>
        <div className="grid grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>
          <div className="p-5" style={{ background: 'var(--surface)' }}>
            <p className="font-mono text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {usage.scans_today}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>
              scans today
            </p>
          </div>
          <div className="p-5" style={{ background: 'var(--surface)' }}>
            <p className="font-mono text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {usage.replies_this_month}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>
              replies / month
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
