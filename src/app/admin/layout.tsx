'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Users, CreditCard, MessageSquare, Key, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
  { href: '/admin/api-keys', label: 'API Keys', icon: Key },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mrr, setMrr] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then((d) => setMrr(d.monthlyRevenue ?? null));
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, var(--accent), #a78bfa, var(--accent))' }} />

      <div className="flex" style={{ minHeight: 'calc(100vh - 3px)' }}>
        {/* Sidebar */}
        <aside className="w-[220px] flex-shrink-0 border-r flex flex-col hidden lg:flex" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="p-5">
            <Link href="/dashboard" className="flex items-center gap-2 font-mono text-[11px] mb-5 transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              <ArrowLeft size={12} /> Back to app
            </Link>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-7 h-7 flex items-center justify-center font-mono text-[10px] font-bold" style={{ background: 'var(--accent)', color: '#fff', borderRadius: 4 }}>A</span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>Admin</span>
            </div>
            {mrr !== null && (
              <p className="font-mono text-[10px] mt-2" style={{ color: 'var(--text-secondary)' }}>
                MRR: <span style={{ color: 'var(--green)', fontWeight: 700 }}>${mrr}</span>
              </p>
            )}
          </div>

          <div className="h-px mx-4" style={{ background: 'var(--border)' }} />

          <nav className="flex-1 p-3 space-y-0.5 mt-1">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 font-mono text-[12px] transition-all rounded-sm"
                  style={{
                    color: active ? 'var(--text)' : 'var(--text-secondary)',
                    background: active ? 'var(--surface-el)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <item.icon size={14} strokeWidth={active ? 2.2 : 1.6} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
