'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Clock, Mail, FileText } from 'lucide-react';

const SUBJECTS = [
  'I have a question about my plan',
  'Technical issue / bug report',
  'Billing question',
  'API integration help',
  'Feature request',
  'Other',
];

export default function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function prefill() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setName(user.email?.split('@')[0] || '');
        setUserId(user.id);
      }
    }
    prefill();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, user_id: userId }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Failed to send message.');
      }
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>TL</span>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>ThreadLeads</span>
          </Link>
          <Link href="/dashboard" className="font-mono text-xs" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Dashboard
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48 }}>

          {/* Left info */}
          <div style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
            <p className="font-mono" style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Support</p>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
              We&apos;re here to help
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.7 }}>
              Send us a message and we&apos;ll get back to you within 24 hours.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 32, marginBottom: 40 }}>
              {[
                { icon: Clock, label: 'Response time', value: 'Within 24 hours' },
                { icon: Mail, label: 'Email directly', value: 'pm.marine@admasol.com' },
                { icon: FileText, label: 'Developer docs', value: 'API Reference', href: '/api-docs' },
              ].map((item) => (
                <div key={item.label} style={{ padding: 16, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <item.icon size={16} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                  <p className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</p>
                  {item.href ? (
                    <Link href={item.href} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 2 }}>{item.value}</Link>
                  ) : (
                    <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 2 }}>{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Form or success */}
            {sent ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <style>{`
                  @keyframes checkDraw {
                    from { stroke-dashoffset: 24; }
                    to { stroke-dashoffset: 0; }
                  }
                  @keyframes checkScale {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                  }
                `}</style>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'checkScale 0.5s ease-out both' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 12l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 24, animation: 'checkDraw 0.4s ease-out 0.3s both' }}
                    />
                  </svg>
                </div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text)', marginTop: 20 }}>
                  Message sent!
                </h2>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                  We&apos;ll get back to you at <strong style={{ color: 'var(--text)' }}>{email}</strong> within 24 hours.
                </p>
                <Link href="/dashboard" className="font-mono" style={{ display: 'inline-block', marginTop: 24, fontSize: 12, color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Back to dashboard
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: 32 }}>
                {error && (
                  <div style={{ padding: 12, marginBottom: 20, border: '1px solid var(--red)', background: 'var(--surface-el)', fontSize: 13, color: 'var(--red)' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="font-mono" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Name</label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)} required
                      placeholder="Your name"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--surface-el)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label className="font-mono" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Email</label>
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      placeholder="you@example.com"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--surface-el)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="font-mono" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Subject</label>
                  <select
                    value={subject} onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--surface-el)', color: 'var(--text)', fontSize: 14 }}
                  >
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label className="font-mono" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Message</label>
                  <textarea
                    value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} maxLength={2000}
                    placeholder="Describe your issue or question in detail..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--surface-el)', color: 'var(--text)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                  <p className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, textAlign: 'right' }}>
                    {message.length}/2000
                  </p>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="font-mono"
                  style={{ width: '100%', padding: '12px 0', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}
                >
                  {loading ? 'sending...' : 'send message'}
                </button>
              </form>
            )}

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 24, fontStyle: 'italic', textAlign: 'center' }}>
              Every message is read personally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
