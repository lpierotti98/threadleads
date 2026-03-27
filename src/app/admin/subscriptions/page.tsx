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
  email?: string;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    async function load() {
      const sc = createClient();
      const { data } = await sc.from('subscriptions').select('*').order('created_at', { ascending: false });
      setSubs((data as Sub[]) || []);
    }
    load();
  }, []);

  const filtered = subs.filter((s) => {
    if (filterPlan !== 'all' && s.plan !== filterPlan) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Subscriptions</h1>

      <div className="flex gap-3 mb-4">
        <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} className="font-mono text-xs px-3 py-2 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          <option value="all">All plans</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="font-mono text-xs px-3 py-2 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      <div style={{ border: '1px solid var(--border)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-el)' }}>
              {['User ID', 'Plan', 'Status', 'Stripe Customer', 'Created'].map((h) => (
                <th key={h} className="font-mono" style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 11 }}>{s.user_id.substring(0, 8)}...</td>
                <td style={{ padding: '10px 14px' }}>
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5" style={{ background: s.plan === 'pro' ? 'var(--accent)' : 'var(--surface-el)', color: s.plan === 'pro' ? '#fff' : 'var(--text)' }}>{s.plan}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5" style={{ background: s.status === 'active' ? 'var(--green)' : 'var(--red)', color: '#0f172a' }}>{s.status}</span>
                </td>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 11 }}>{s.stripe_customer_id || '—'}</td>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 11 }}>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
