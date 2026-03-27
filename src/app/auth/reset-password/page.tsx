'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase client auto-detects the recovery token from the URL hash
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    // Also set ready after a short delay in case the event already fired
    const timer = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Redirect with success toast
      router.push('/dashboard?toast=Password+updated+successfully');
      router.refresh();
    }
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
          <h1 className="font-serif text-3xl" style={{ color: 'var(--text)' }}>Reset password</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Enter your new password below</p>
        </div>

        {!ready ? (
          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Verifying reset link...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm p-3 border font-mono text-xs" style={{ background: 'var(--surface)', borderColor: 'var(--red)', color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border px-4 py-3 text-sm rounded-sm"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full border px-4 py-3 text-sm rounded-sm"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="Confirm your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {loading ? 'updating...' : 'update password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/login" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
