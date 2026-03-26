'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setLoading(false); }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center">
          <p className="font-serif text-2xl mb-3" style={{ color: 'var(--text)' }}>Check your email</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
          </p>
          <Link href="/login" className="inline-block mt-6 font-mono text-xs underline underline-offset-2" style={{ color: 'var(--accent)' }}>Back to login</Link>
        </div>
      </div>
    );
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
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm p-3 border font-mono text-xs" style={{ background: 'var(--surface)', borderColor: 'var(--red)', color: 'var(--red)' }}>{error}</div>
          )}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border px-4 py-3 text-sm rounded-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full border px-4 py-3 text-sm rounded-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} placeholder="Min. 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors" style={{ background: 'var(--accent)', color: 'white' }}>
            {loading ? 'creating...' : 'create account'}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
          Have an account?{' '}
          <Link href="/login" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
