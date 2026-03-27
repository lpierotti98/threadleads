'use client';

import { useEffect, useState } from 'react';
import { Users, CreditCard, Zap, DollarSign, MessageSquare, Key } from 'lucide-react';

interface Stats { activeSubscriptions: number; starterCount: number; proCount: number; totalTickets: number; totalApiKeys: number; monthlyRevenue: number; }
interface Ticket { id: string; name: string; subject: string; created_at: string; status: string; }

function timeAgo(d: string) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats);
    fetch('/api/admin/tickets').then((r) => r.json()).then((d) => setTickets((d.tickets || []).slice(0, 3)));
  }, []);

  if (!stats) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading...</p>;

  const cards = [
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: Users, color: '#3b82f6', bg: '#eff6ff', border: '#3b82f6' },
    { label: 'Starter Plans', value: stats.starterCount, icon: CreditCard, color: '#4f46e5', bg: '#eef2ff', border: '#4f46e5' },
    { label: 'Pro Plans', value: stats.proCount, icon: Zap, color: '#8b5cf6', bg: '#f5f3ff', border: '#8b5cf6' },
    { label: 'Monthly Revenue', value: `$${stats.monthlyRevenue}`, icon: DollarSign, color: '#10b981', bg: '#ecfdf5', border: '#10b981' },
    { label: 'Support Tickets', value: stats.totalTickets, icon: MessageSquare, color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b' },
    { label: 'API Keys', value: stats.totalApiKeys, icon: Key, color: '#64748b', bg: '#f8fafc', border: '#94a3b8' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 26, fontWeight: 700, color: '#0f172a' }}>Overview</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>ThreadLeads admin dashboard</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: c.border }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{c.value}</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={18} color={c.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tickets */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Recent Tickets</p>
        </div>
        {tickets.length === 0 ? (
          <p style={{ padding: 20, fontSize: 13, color: '#94a3b8' }}>No tickets yet</p>
        ) : (
          tickets.map((t, i) => (
            <div key={t.id} style={{ padding: '14px 20px', borderBottom: i < tickets.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{t.subject}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t.name} &middot; {timeAgo(t.created_at)}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 4, background: t.status === 'resolved' ? '#ecfdf5' : '#fffbeb', color: t.status === 'resolved' ? '#059669' : '#d97706' }}>{t.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
