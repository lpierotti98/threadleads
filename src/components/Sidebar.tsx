'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  CreditCard,
  Settings,
  Code2,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/settings/keywords', label: 'Keywords', icon: Search },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/api-docs', label: 'API Docs', icon: Code2 },
  { href: '/support', label: 'Support', icon: LifeBuoy },
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
          <div
            className="w-9 h-9 border flex items-center justify-center transition-colors"
            style={{ borderColor: 'var(--accent)' }}
          >
            <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>
              TL
            </span>
          </div>
          <span className="font-serif text-lg" style={{ color: 'var(--text)' }}>
            ThreadLeads
          </span>
        </Link>
      </div>

      <div className="px-4 mb-2">
        <div className="h-px" style={{ background: 'var(--border)' }} />
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-mono transition-all duration-200 border-l-2"
              style={{
                color: active ? 'var(--text)' : 'var(--text-secondary)',
                borderLeftColor: active ? 'var(--accent)' : 'transparent',
                background: active ? 'var(--accent-soft)' : 'transparent',
              }}
            >
              <item.icon size={16} strokeWidth={active ? 2.2 : 1.6} />
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
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg"
        style={{ background: 'var(--surface)', color: 'var(--text)' }}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[240px] flex flex-col transform transition-transform lg:translate-x-0 border-r ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {nav}
      </aside>
    </>
  );
}
