'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Check, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/lib/theme';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [usage, setUsage] = useState({ scans_today: 0, replies_this_month: 0 });
  const [productMention, setProductMention] = useState('');
  const [pmSaved, setPmSaved] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);
  const [alertHigh, setAlertHigh] = useState(false);
  const [defaultDays, setDefaultDays] = useState(7);
  const [defaultMinScore, setDefaultMinScore] = useState(40);
  const [defaultSource, setDefaultSource] = useState('all');
  const [scanPrefsSaved, setScanPrefsSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');

      const { data: sub } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).eq('status', 'active').maybeSingle();
      setPlan(sub?.plan || null);

      const { data: settings } = await supabase.from('users_settings').select('product_mention, default_days, default_min_score, default_source').eq('user_id', user.id).maybeSingle();
      if (settings?.product_mention) setProductMention(settings.product_mention);
      if (settings?.default_days) setDefaultDays(settings.default_days);
      if (settings?.default_min_score) setDefaultMinScore(settings.default_min_score);
      if (settings?.default_source) setDefaultSource(settings.default_source);

      const { data: u } = await supabase.from('usage').select('*').eq('user_id', user.id).maybeSingle();
      if (u) setUsage(u);
    }
    load();
  }, [supabase]);

  async function handleSaveProductMention() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('users_settings').upsert({ user_id: user.id, product_mention: productMention.trim() || null }, { onConflict: 'user_id' });
    setPmSaved(true);
    toast('Product mention saved', 'success');
    setTimeout(() => setPmSaved(false), 2000);
  }

  async function handleSaveScanPrefs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('users_settings').upsert({
      user_id: user.id,
      default_days: defaultDays,
      default_min_score: defaultMinScore,
      default_source: defaultSource,
    }, { onConflict: 'user_id' });
    setScanPrefsSaved(true);
    toast('Scan preferences saved', 'success');
    setTimeout(() => setScanPrefsSaved(false), 2000);
  }

  async function handleResetPassword() {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast('Failed to send reset email', 'error');
    } else {
      toast('Password reset email sent', 'success');
    }
  }

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>
          Settings
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Account, appearance, and preferences
        </p>
      </div>

      {/* Appearance */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Appearance
        </p>
        <div className="border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className="flex-1 flex flex-col items-center gap-2 p-4 border rounded-sm transition-all"
                style={{
                  borderColor: theme === opt.value ? 'var(--accent)' : 'var(--border)',
                  background: theme === opt.value ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                <div
                  className="w-10 h-10 rounded-sm border flex items-center justify-center"
                  style={{
                    background: opt.value === 'light' ? '#fff' : opt.value === 'dark' ? '#1e293b' : 'var(--surface-el)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <opt.icon size={16} style={{ color: theme === opt.value ? 'var(--accent)' : 'var(--text-secondary)' }} />
                </div>
                <span className="font-mono text-[11px]" style={{ color: theme === opt.value ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Account */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Account
        </p>
        <div className="border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>email</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>{email}</p>
          </div>
          <div className="h-px" style={{ background: 'var(--border)' }} />
          <button
            onClick={handleResetPassword}
            className="font-mono text-xs underline underline-offset-2"
            style={{ color: 'var(--accent)' }}
          >
            Change password
          </button>
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
                  <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text)' }}>{plan} Plan</span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5" style={{ background: 'var(--green)', color: '#0e0e0f' }}>Active</span>
                </div>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{plan === 'starter' ? '$49/month' : '$99/month'}</p>
              </div>
              <Link href="/pricing" className="font-mono text-xs underline underline-offset-2" style={{ color: 'var(--accent)' }}>manage</Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No active plan</p>
              <Link href="/pricing" className="font-mono text-xs font-bold uppercase tracking-wider px-4 py-2" style={{ background: 'var(--accent)', color: 'white' }}>view plans</Link>
            </div>
          )}
        </div>
      </section>

      {/* Scanning Preferences */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Scanning Preferences
        </p>
        <div className="border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Time range</label>
              <select
                value={defaultDays}
                onChange={(e) => setDefaultDays(Number(e.target.value))}
                className="font-mono text-xs px-3 py-2 border rounded-sm w-full"
                style={{ background: 'var(--surface-el)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value={1}>24h</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>3 months</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>
                Min score: {defaultMinScore}
              </label>
              <input type="range" min={20} max={80} value={defaultMinScore} onChange={(e) => setDefaultMinScore(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Source</label>
              <select
                value={defaultSource}
                onChange={(e) => setDefaultSource(e.target.value)}
                className="font-mono text-xs px-3 py-2 border rounded-sm w-full"
                style={{ background: 'var(--surface-el)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="all">All</option>
                <option value="reddit">Reddit only</option>
                <option value="hn">HN only</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSaveScanPrefs}
            className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2 flex items-center gap-1.5 transition-colors"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {scanPrefsSaved ? <><Check size={13} /> saved</> : 'save preferences'}
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Notifications
        </p>
        <div className="border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm" style={{ color: 'var(--text)' }}>Weekly email digest of high-intent threads</span>
            <button
              onClick={() => setEmailDigest(!emailDigest)}
              className="w-9 h-5 rounded-full relative transition-colors"
              style={{ background: emailDigest ? 'var(--accent)' : 'var(--border)' }}
            >
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: emailDigest ? '18px' : '2px' }} />
            </button>
          </label>
          <div className="h-px" style={{ background: 'var(--border)' }} />
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm" style={{ color: 'var(--text)' }}>Alert when thread scores above 80</span>
            <button
              onClick={() => setAlertHigh(!alertHigh)}
              className="w-9 h-5 rounded-full relative transition-colors"
              style={{ background: alertHigh ? 'var(--accent)' : 'var(--border)' }}
            >
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: alertHigh ? '18px' : '2px' }} />
            </button>
          </label>
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
              className="flex-1 border px-4 py-2.5 text-sm rounded-sm"
              style={{ background: 'var(--surface-el)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <button
              onClick={handleSaveProductMention}
              className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 flex items-center gap-1.5 transition-colors"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {pmSaved ? <><Check size={13} /> saved</> : 'save'}
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
            <p className="font-mono text-3xl font-bold" style={{ color: 'var(--text)' }}>{usage.scans_today}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>scans today</p>
          </div>
          <div className="p-5" style={{ background: 'var(--surface)' }}>
            <p className="font-mono text-3xl font-bold" style={{ color: 'var(--text)' }}>{usage.replies_this_month}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>replies / month</p>
          </div>
        </div>
      </section>
    </div>
  );
}
