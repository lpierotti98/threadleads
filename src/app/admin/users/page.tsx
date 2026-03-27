'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface User { id: string; email: string; created_at: string; plan: string | null; scans_today: number; replies_this_month: number; }

function initials(email: string) { return (email || '??').substring(0, 2).toUpperCase(); }
function planBadge(plan: string | null) {
  if (plan === 'pro') return { bg: '#f5f3ff', color: '#7c3aed', label: 'Pro' };
  if (plan === 'starter') return { bg: '#eef2ff', color: '#4f46e5', label: 'Starter' };
  return { bg: '#f1f5f9', color: '#94a3b8', label: 'Free' };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`).then((r) => r.json()).then((d) => setUsers(d.users || []));
  }, [page, search]);

  return (
    <div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 26, fontWeight: 700, color: '#0f172a' }}>Users</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>All registered accounts</p>

      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by email..."
          style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#0f172a' }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['User', 'Plan', 'Scans/day', 'Replies/mo', 'Joined'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const pb = planBadge(u.plan);
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.plan ? '#eef2ff' : '#f1f5f9', color: u.plan ? '#4f46e5' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{initials(u.email)}</div>
                      <span style={{ fontSize: 13, color: '#0f172a' }}>{u.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: pb.bg, color: pb.color }}>{pb.label}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', fontFamily: "'IBM Plex Mono', monospace" }}>{u.scans_today}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', fontFamily: "'IBM Plex Mono', monospace" }}>{u.replies_this_month}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No users found</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} style={{ fontSize: 12, padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 6, color: '#64748b', background: '#fff', cursor: 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>Previous</button>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={users.length < 20} style={{ fontSize: 12, padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 6, color: '#64748b', background: '#fff', cursor: 'pointer', opacity: users.length < 20 ? 0.4 : 1 }}>Next</button>
      </div>
    </div>
  );
}
