'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Sub {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  created_at: string;
}

const FILTERS = ['all', 'active', 'canceled', 'starter', 'pro'] as const;

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const sc = createClient();
      const { data } = await sc.from('subscriptions').select('*').order('created_at', { ascending: false });
      setSubs((data as Sub[]) || []);
    }
    load();
  }, []);

  const filtered = subs.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'active' || filter === 'canceled') return s.status === filter;
    if (filter === 'starter' || filter === 'pro') return s.plan === filter;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Subscriptions</h1>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="font-mono text-[11px] px-3 py-1.5 transition-all capitalize"
            style={{
              background: filter === f ? 'var(--accent)' : 'var(--surface)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 4,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="border overflow-auto" style={{ borderColor: 'var(--border)', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-el)' }}>
              {['User ID', 'Plan', 'Status', 'Stripe ID', 'Created'].map((h) => (
                <th key={h} className="font-mono" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <td className="font-mono text-[11px]" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{s.user_id.substring(0, 12)}...</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5" style={{ background: s.plan === 'pro' ? '#a78bfa' : 'var(--accent)', color: '#fff', borderRadius: 2 }}>{s.plan}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5" style={{ background: s.status === 'active' ? 'var(--green)' : 'var(--red)', color: '#0f172a', borderRadius: 2 }}>{s.status}</span>
                </td>
                <td className="font-mono text-[10px]" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{s.stripe_customer_id ? s.stripe_customer_id.substring(0, 18) + '...' : '—'}</td>
                <td className="font-mono text-[11px]" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="font-mono text-xs" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No subscriptions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
