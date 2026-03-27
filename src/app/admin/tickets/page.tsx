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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Support Tickets</h1>

      <div className="space-y-px" style={{ background: 'var(--border)' }}>
        {tickets.map((t) => (
          <div key={t.id} style={{ background: 'var(--surface)' }}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 flex-shrink-0"
                  style={{
                    background: t.status === 'resolved' ? 'var(--green)' : 'var(--amber)',
                    color: '#0f172a',
                  }}
                >
                  {t.status}
                </span>
                <span className="text-sm truncate" style={{ color: 'var(--text)' }}>{t.subject}</span>
                <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{t.name} &lt;{t.email}&gt;</span>
              </div>
              <span className="font-mono text-[10px] flex-shrink-0 ml-3" style={{ color: 'var(--text-secondary)' }}>
                {new Date(t.created_at).toLocaleDateString()}
              </span>
            </div>

            {expanded === t.id && (
              <div className="px-4 pb-4 animate-fade-slide-in">
                <div className="p-4 border text-sm whitespace-pre-wrap" style={{ background: 'var(--surface-el)', borderColor: 'var(--border)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {t.message}
                </div>
                {t.status !== 'resolved' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleResolve(t.id); }}
                    className="font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 mt-3"
                    style={{ background: 'var(--green)', color: '#0f172a' }}
                  >
                    mark resolved
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="p-8 text-center" style={{ background: 'var(--surface)' }}>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>No tickets yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
