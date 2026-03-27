'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
      setKeys((data as ApiKey[]) || []);
    }
    load();
  }, [supabase]);

  async function handleDelete(id: string) {
    await supabase.from('api_keys').delete().eq('id', id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>Admin</p>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>API Keys</h1>

      <div style={{ border: '1px solid var(--border)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-el)' }}>
              {['User ID', 'Name', 'Last Used', 'Created', ''].map((h) => (
                <th key={h} className="font-mono" style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 11 }}>{k.user_id.substring(0, 8)}...</td>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text)', fontSize: 12 }}>{k.name}</td>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 11 }}>
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="font-mono" style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 11 }}>{new Date(k.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => handleDelete(k.id)} className="opacity-40 hover:opacity-100 transition-opacity" style={{ color: 'var(--red)' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No API keys</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
