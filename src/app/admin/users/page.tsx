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
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Users</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search by email..."
        className="font-mono text-xs px-3 py-2 border mb-4 w-full max-w-xs"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />

      <div style={{ border: '1px solid var(--border)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-el)' }}>
              {['Email', 'Plan', 'Scans today', 'Replies/mo', 'Created'].map((h) => (
                <th key={h} className="font-mono" style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text)', fontSize: 12 }}>{u.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  {u.plan ? (
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5" style={{ background: u.plan === 'pro' ? 'var(--accent)' : 'var(--surface-el)', color: u.plan === 'pro' ? '#fff' : 'var(--text)' }}>{u.plan}</span>
                  ) : (
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>free</span>
                  )}
                </td>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 12 }}>{u.scans_today}</td>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 12 }}>{u.replies_this_month}</td>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 11 }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="font-mono text-xs px-3 py-1.5 border disabled:opacity-30" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Prev</button>
        <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={users.length < 20} className="font-mono text-xs px-3 py-1.5 border disabled:opacity-30" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Next</button>
      </div>
    </div>
  );
}
