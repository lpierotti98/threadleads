'use client';

import { useEffect, useState } from 'react';

interface Ticket { id: string; name: string; email: string; subject: string; message: string; status: string; created_at: string; }

function timeAgo(d: string) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/tickets').then((r) => r.json()).then((d) => setTickets(d.tickets || []));
  }, []);

  async function handleResolve(id: string) {
    await fetch(`/api/admin/tickets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved' }) });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t)));
  }

  const filtered = tickets.filter((t) => filter === 'all' || t.status === filter);

  return (
    <div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 26, fontWeight: 700, color: '#0f172a' }}>Support Tickets</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Manage customer support requests</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'open', 'resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: `1px solid ${filter === f ? '#4f46e5' : '#e2e8f0'}`, background: filter === f ? '#4f46e5' : '#fff', color: filter === f ? '#fff' : '#64748b', cursor: 'pointer', textTransform: 'capitalize', fontWeight: filter === f ? 600 : 400, transition: 'all 0.15s' }}>
            {f} {f !== 'all' ? `(${tickets.filter((t) => t.status === f).length})` : ''}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            style={{
              background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: `4px solid ${t.status === 'resolved' ? '#10b981' : '#f59e0b'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow 0.15s',
              opacity: t.status === 'resolved' ? 0.75 : 1,
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
          >
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{t.name}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>{t.email}</span>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{timeAgo(t.created_at)}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#4f46e5', marginBottom: 6 }}>{t.subject}</p>
              {expanded !== t.id && (
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.message}</p>
              )}
              {expanded === t.id && (
                <div onClick={(e) => e.stopPropagation()}>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 12, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>{t.message}</p>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 4, background: t.status === 'resolved' ? '#ecfdf5' : '#fffbeb', color: t.status === 'resolved' ? '#059669' : '#d97706' }}>{t.status}</span>
                {t.status !== 'resolved' && (
                  <button onClick={(e) => { e.stopPropagation(); handleResolve(t.id); }} style={{ fontSize: 11, fontWeight: 500, padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: 6, color: '#059669', background: '#fff', cursor: 'pointer' }}>
                    Mark resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>No tickets found</p>
        </div>
      )}
    </div>
  );
}
