'use client';

import { useEffect, useState } from 'react';

interface Stats {
  activeSubscriptions: number;
  starterCount: number;
  proCount: number;
  totalTickets: number;
  totalApiKeys: number;
  monthlyRevenue: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) {
    return <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  }

  const cards = [
    { label: 'Active Subs', value: stats.activeSubscriptions },
    { label: 'Starter', value: stats.starterCount },
    { label: 'Pro', value: stats.proCount },
    { label: 'MRR', value: `$${stats.monthlyRevenue}` },
    { label: 'Support Tickets', value: stats.totalTickets },
    { label: 'API Keys', value: stats.totalApiKeys },
  ];

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 32 }}>Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
        {cards.map((c) => (
          <div key={c.label} className="p-6" style={{ background: 'var(--surface)' }}>
            <p className="font-mono text-3xl font-bold" style={{ color: 'var(--text)' }}>{c.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
