'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, CreditCard, MessageSquare, Key, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/tickets', label: 'Support Tickets', icon: MessageSquare },
  { href: '/admin/api-keys', label: 'API Keys', icon: Key },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <aside className="w-[220px] flex-shrink-0 border-r flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="p-5 pb-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-mono text-[11px] mb-4" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={12} /> Back to app
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 border flex items-center justify-center font-mono text-[10px] font-bold" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>A</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>Admin</span>
          </div>
        </div>
        <div className="h-px mx-4" style={{ background: 'var(--border)' }} />
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 font-mono text-[12px] transition-all border-l-2"
                style={{
                  color: active ? 'var(--text)' : 'var(--text-secondary)',
                  borderLeftColor: active ? 'var(--red)' : 'transparent',
                  background: active ? 'var(--surface-el)' : 'transparent',
                }}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
