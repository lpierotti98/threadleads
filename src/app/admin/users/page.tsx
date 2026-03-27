'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  created_at: string;
  plan: string | null;
  scans_today: number;
  replies_this_month: number;
}

function initials(email: string): string {
  return (email || '??').substring(0, 2).toUpperCase();
}

function planStyle(plan: string | null): { bg: string; color: string; label: string } {
  if (plan === 'pro') return { bg: '#a78bfa', color: '#fff', label: 'PRO' };
  if (plan === 'starter') return { bg: 'var(--accent)', color: '#fff', label: 'STARTER' };
  return { bg: 'var(--surface-el)', color: 'var(--text-secondary)', label: 'FREE' };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
  }, [page, search]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Users</h1>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search by email..."
        className="font-mono text-xs px-4 py-2.5 border w-full max-w-sm"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: 4 }}
      />

      <div className="border overflow-auto" style={{ borderColor: 'var(--border)', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-el)' }}>
              {['User', 'Plan', 'Scans/day', 'Replies/mo', 'Joined'].map((h) => (
                <th key={h} className="font-mono" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const ps = planStyle(u.plan);
              return (
                <tr key={u.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        {initials(u.email || '')}
                      </div>
                      <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>{u.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5" style={{ background: ps.bg, color: ps.color, borderRadius: 2 }}>{ps.label}</span>
                  </td>
                  <td className="font-mono text-xs" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.scans_today}</td>
                  <td className="font-mono text-xs" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.replies_this_month}</td>
                  <td className="font-mono text-[11px]" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={5} className="font-mono text-xs" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="font-mono text-xs px-3 py-1.5 border disabled:opacity-30 transition-opacity" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', borderRadius: 4 }}>Prev</button>
        <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={users.length < 20} className="font-mono text-xs px-3 py-1.5 border disabled:opacity-30 transition-opacity" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', borderRadius: 4 }}>Next</button>
      </div>
    </div>
  );
}
