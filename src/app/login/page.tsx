'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push('/dashboard'); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 border flex items-center justify-center" style={{ borderColor: 'var(--accent)' }}>
              <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>TL</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl" style={{ color: 'var(--text)' }}>ThreadLeads</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Turn conversations into pipeline</p>
        </div>

        {forgotMode ? (
          resetSent ? (
            <div className="text-center">
              <div className="p-4 border rounded-sm mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--accent)' }}>
                <p className="text-sm" style={{ color: 'var(--text)' }}>Check your email for a reset link</p>
              </div>
              <button
                onClick={() => { setForgotMode(false); setResetSent(false); setError(''); }}
                className="font-mono text-xs underline underline-offset-2"
                style={{ color: 'var(--accent)' }}
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              setLoading(true);
              const supabase = createClient();
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://threadleads.app/auth/reset-password',
              });
              if (error) { setError(error.message); setLoading(false); }
              else { setResetSent(true); setLoading(false); }
            }} className="space-y-4">
              {error && (
                <div className="text-sm p-3 border font-mono text-xs" style={{ background: 'var(--surface)', borderColor: 'var(--red)', color: 'var(--red)' }}>
                  {error}
                </div>
              )}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border px-4 py-3 text-sm rounded-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors" style={{ background: 'var(--accent)', color: 'white' }}>
                {loading ? 'sending...' : 'send reset link'}
              </button>
              <p className="text-center">
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setError(''); }}
                  className="font-mono text-xs underline underline-offset-2"
                  style={{ color: 'var(--accent)' }}
                >
                  Back to login
                </button>
              </p>
            </form>
          )
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm p-3 border font-mono text-xs" style={{ background: 'var(--surface)', borderColor: 'var(--red)', color: 'var(--red)' }}>
                  {error}
                </div>
              )}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border px-4 py-3 text-sm rounded-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} placeholder="you@example.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Password</label>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(''); }}
                    className="font-mono text-[10px] underline underline-offset-2"
                    style={{ color: 'var(--accent)' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border px-4 py-3 text-sm rounded-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} placeholder="Enter your password" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors" style={{ background: 'var(--accent)', color: 'white' }}>
                {loading ? 'signing in...' : 'sign in'}
              </button>
            </form>

            <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
              No account?{' '}
              <Link href="/signup" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>Sign up</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
