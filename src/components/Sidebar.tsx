'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { href: '/settings/keywords', label: 'keywords', icon: Search },
  { href: '/pricing', label: 'pricing', icon: CreditCard },
  { href: '/settings', label: 'settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function getEmail() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email || '');
    }
    getEmail();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const nav = (
    <>
      <div className="p-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 border border-[var(--accent)] flex items-center justify-center">
            <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>
              TL
            </span>
          </div>
          <span className="font-serif text-lg" style={{ color: 'var(--text-primary)' }}>
            ThreadLeads
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-mono transition-colors"
              style={{
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pb-4 space-y-3">
        <div className="h-px" style={{ background: 'var(--border)' }} />
        {email && (
          <p className="font-mono text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
            {email}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 font-mono text-[12px] transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut size={13} />
          logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5"
        style={{ background: '#0a0a0b', color: 'var(--text-primary)' }}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[240px] flex flex-col transform transition-transform lg:translate-x-0 border-r ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#0a0a0b',
          borderColor: 'var(--border)',
        }}
      >
        {nav}
      </aside>
    </>
  );
}
