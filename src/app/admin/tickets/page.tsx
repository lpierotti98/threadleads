'use client';

import { useEffect, useState } from 'react';

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/admin/tickets').then((r) => r.json()).then((d) => setTickets(d.tickets || []));
  }, []);

  async function handleResolve(id: string) {
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t)));
  }

  const filtered = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Support Tickets</h1>
      </div>

      <div className="flex gap-2">
        {['all', 'open', 'resolved'].map((f) => (
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
            {f} {f !== 'all' && `(${tickets.filter((t) => t.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="border border-l-[3px] transition-all cursor-pointer animate-fade-slide-in"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              borderLeftColor: t.status === 'resolved' ? 'var(--green)' : 'var(--amber)',
              opacity: t.status === 'resolved' ? 0.7 : 1,
              borderRadius: 4,
            }}
            onClick={() => setExpanded(expanded === t.id ? null : t.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.name}</span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>&lt;{t.email}&gt;</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="font-mono text-[9px] font-bold uppercase px-2 py-0.5"
                    style={{ background: t.status === 'resolved' ? 'var(--green)' : 'var(--amber)', color: '#0f172a', borderRadius: 2 }}
                  >
                    {t.status}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>{timeAgo(t.created_at)}</span>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.subject}</p>
              {expanded !== t.id && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.message}</p>
              )}
            </div>

            {expanded === t.id && (
              <div className="px-4 pb-4 animate-fade-slide-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border text-sm whitespace-pre-wrap" style={{ background: 'var(--surface-el)', borderColor: 'var(--border)', color: 'var(--text-secondary)', lineHeight: 1.7, borderRadius: 4 }}>
                  {t.message}
                </div>
                {t.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(t.id)}
                    className="font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 mt-3 transition-colors"
                    style={{ background: 'var(--green)', color: '#0f172a', borderRadius: 4 }}
                  >
                    mark resolved
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-12 text-center border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 4 }}>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>No tickets found</p>
          </div>
        )}
      </div>
    </div>
  );
}
