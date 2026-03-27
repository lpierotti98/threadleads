'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex" style={{ width: 220, flexShrink: 0, flexDirection: 'column', background: '#fff', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ padding: '24px 20px 16px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
            <span style={{ width: 26, height: 26, background: '#4f46e5', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>TL</span>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f172a' }}>ThreadLeads</span>
          </Link>
          <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: 3 }}>Admin</span>
        </div>

        <div style={{ height: 1, margin: '0 16px', background: '#e2e8f0' }} />

        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 2,
                  fontSize: 13, fontWeight: active ? 600 : 400, borderRadius: 6,
                  textDecoration: 'none', transition: 'all 0.15s',
                  color: active ? '#4f46e5' : '#64748b',
                  background: active ? '#eef2ff' : 'transparent',
                  borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
                }}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>
            <ArrowLeft size={12} /> Back to app
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 32px 48px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
