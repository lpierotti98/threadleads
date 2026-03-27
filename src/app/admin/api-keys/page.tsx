'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Key } from 'lucide-react';

interface ApiKey { id: string; user_id: string; name: string; last_used_at: string | null; created_at: string; }

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('api_keys').select('*').order('created_at', { ascending: false }).then(({ data }) => setKeys((data as ApiKey[]) || []));
  }, [supabase]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this API key? This cannot be undone.')) return;
    await supabase.from('api_keys').delete().eq('id', id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 26, fontWeight: 700, color: '#0f172a' }}>API Keys</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>All generated API keys across users</p>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['User ID', 'Key Name', 'Created', 'Last Used', ''].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k, i) => (
              <tr key={k.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: "'IBM Plex Mono', monospace" }}>{k.user_id.substring(0, 12)}...</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a' }}>{k.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{new Date(k.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => handleDelete(k.id)} style={{ color: '#ef4444', opacity: 0.5, cursor: 'pointer', background: 'none', border: 'none', transition: 'opacity 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 48, textAlign: 'center' }}>
                  <Key size={32} style={{ color: '#e2e8f0', margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>No API keys have been generated yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
