'use client';

import { useEffect, useState } from 'react';
import { Users, CreditCard, Zap, DollarSign, MessageSquare, Key } from 'lucide-react';

interface Stats {
  activeSubscriptions: number;
  starterCount: number;
  proCount: number;
  totalTickets: number;
  totalApiKeys: number;
  monthlyRevenue: number;
}

interface Ticket {
  id: string;
  name: string;
  subject: string;
  created_at: string;
  status: string;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats);
    fetch('/api/admin/tickets').then((r) => r.json()).then((d) => setTickets((d.tickets || []).slice(0, 5)));
  }, []);

  if (!stats) {
    return <p className="font-mono text-xs animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>;
  }

  const cards = [
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: Users, color: 'var(--accent)' },
    { label: 'Starter Plans', value: stats.starterCount, icon: CreditCard, color: 'var(--accent)' },
    { label: 'Pro Plans', value: stats.proCount, icon: Zap, color: '#a78bfa' },
    { label: 'Monthly Revenue', value: `$${stats.monthlyRevenue}`, icon: DollarSign, color: 'var(--green)' },
    { label: 'Support Tickets', value: stats.totalTickets, icon: MessageSquare, color: 'var(--amber)' },
    { label: 'API Keys', value: stats.totalApiKeys, icon: Key, color: 'var(--text-secondary)' },
  ];

  const avgRevPerSub = stats.activeSubscriptions > 0
    ? Math.round(stats.monthlyRevenue / stats.activeSubscriptions)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Overview</h1>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="p-5 border animate-fade-slide-in"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeftWidth: 3, borderLeftColor: c.color, animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <c.icon size={16} style={{ color: c.color }} />
            </div>
            <p className="font-mono text-3xl font-bold" style={{ color: 'var(--text)' }}>{c.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent tickets */}
        <div className="border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Recent Tickets</p>
          </div>
          {tickets.length === 0 ? (
            <p className="p-5 text-sm" style={{ color: 'var(--text-secondary)' }}>No tickets yet</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {tickets.map((t) => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{t.subject}</p>
                    <p className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>{t.name}</p>
                  </div>
                  <span
                    className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 flex-shrink-0 ml-3"
                    style={{ background: t.status === 'resolved' ? 'var(--green)' : 'var(--amber)', color: '#0f172a' }}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Quick Stats</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Avg revenue per subscriber</p>
              <p className="font-mono text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>${avgRevPerSub}<span className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>/mo</span></p>
            </div>
            <div className="h-px" style={{ background: 'var(--border)' }} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Plan distribution</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  {stats.activeSubscriptions > 0 && (
                    <div className="h-full rounded-full" style={{
                      width: `${(stats.proCount / stats.activeSubscriptions) * 100}%`,
                      background: 'linear-gradient(90deg, var(--accent), #a78bfa)',
                    }} />
                  )}
                </div>
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {stats.activeSubscriptions > 0 ? Math.round((stats.proCount / stats.activeSubscriptions) * 100) : 0}% Pro
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
