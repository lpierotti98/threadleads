'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Sub { id: string; user_id: string; plan: string; status: string; stripe_customer_id: string | null; created_at: string; }

const FILTERS = ['all', 'starter', 'pro', 'active', 'canceled'] as const;

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    createClient().from('subscriptions').select('*').order('created_at', { ascending: false }).then(({ data }) => setSubs((data as Sub[]) || []));
  }, []);

  const filtered = subs.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'active' || filter === 'canceled') return s.status === filter;
    return s.plan === filter;
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 26, fontWeight: 700, color: '#0f172a' }}>Subscriptions</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>All subscription records</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: `1px solid ${filter === f ? '#4f46e5' : '#e2e8f0'}`, background: filter === f ? '#4f46e5' : '#fff', color: filter === f ? '#fff' : '#64748b', cursor: 'pointer', textTransform: 'capitalize', fontWeight: filter === f ? 600 : 400, transition: 'all 0.15s' }}>{f}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['User ID', 'Plan', 'Status', 'Stripe ID', 'Created'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: "'IBM Plex Mono', monospace" }}>{s.user_id.substring(0, 12)}...</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: s.plan === 'pro' ? '#f5f3ff' : '#eef2ff', color: s.plan === 'pro' ? '#7c3aed' : '#4f46e5' }}>{s.plan}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: s.status === 'active' ? '#059669' : '#dc2626', color: '#fff' }}>{s.status}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: '#94a3b8', fontFamily: "'IBM Plex Mono', monospace" }}>{s.stripe_customer_id ? s.stripe_customer_id.substring(0, 20) + '...' : '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No subscriptions found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
