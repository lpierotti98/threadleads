'use client';

import Link from 'next/link';

const S = { h2: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700 as const, color: 'var(--text)', marginTop: 48, marginBottom: 12 }, p: { fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }, ul: { paddingLeft: 20, marginBottom: 16 }, li: { fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 6 } };

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>TL</span>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>ThreadLeads</span>
          </Link>
          <Link href="/terms" className="font-mono text-xs" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <p className="font-mono" style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 36, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Privacy Policy</h1>
        <p className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 48 }}>Last updated: March 2026</p>

        <p style={S.p}>
          ThreadLeads (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding that data.
        </p>

        <h2 style={S.h2}>1. What Data We Collect</h2>
        <p style={S.p}>We collect the following information when you use ThreadLeads:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Account information:</strong> your email address and password (hashed) when you sign up.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Keywords and settings:</strong> the search keywords you configure, your product mention text, and scanning preferences.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Thread data:</strong> public forum threads we find and score on your behalf, including titles, URLs, content previews, and AI-generated scores.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Usage data:</strong> scan counts, reply generation counts, and timestamps to enforce plan limits.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Payment information:</strong> processed entirely by Stripe. We never see or store your card details.</li>
        </ul>

        <h2 style={S.h2}>2. How We Use Your Data</h2>
        <p style={S.p}>We use your data to:</p>
        <ul style={S.ul}>
          <li style={S.li}>Provide the ThreadLeads service: scanning forums, scoring threads, and generating replies based on your keywords.</li>
          <li style={S.li}>Enforce usage limits according to your subscription plan.</li>
          <li style={S.li}>Send you transactional emails related to your account (password resets, support responses).</li>
          <li style={S.li}>Improve the product based on aggregate, anonymized usage patterns.</li>
        </ul>
        <p style={S.p}>We do not sell your data. We do not use your data for advertising. We do not train AI models on your data.</p>

        <h2 style={S.h2}>3. Third-Party Services</h2>
        <p style={S.p}>ThreadLeads relies on the following third-party services to operate:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Supabase</strong> — database and authentication. Your data is stored on Supabase infrastructure.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Stripe</strong> — payment processing. Stripe handles all billing data under their own privacy policy.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Anthropic (Claude AI)</strong> — AI scoring and reply generation. Thread titles and content previews are sent to Claude for analysis. Anthropic does not use API inputs for training.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Reddit and Hacker News</strong> — we access publicly available data from these platforms via their public feeds and APIs.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Resend</strong> — email delivery for support tickets.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Vercel</strong> — application hosting.</li>
        </ul>

        <h2 style={S.h2}>4. Data Retention</h2>
        <p style={S.p}>
          We retain your data for as long as your account is active. When you delete your account, all associated data (keywords, threads, usage records, API keys) is permanently deleted from our database. Stripe retains payment records independently per their own policy.
        </p>

        <h2 style={S.h2}>5. Your Rights</h2>
        <p style={S.p}>You have the right to:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Access</strong> your data at any time through the dashboard and settings.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Delete</strong> your account and all associated data by contacting us.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Export</strong> your thread data via the API.</li>
          <li style={S.li}><strong style={{ color: 'var(--text)' }}>Correct</strong> any inaccurate information in your settings.</li>
        </ul>

        <h2 style={S.h2}>6. Security</h2>
        <p style={S.p}>
          We use industry-standard security measures including encrypted connections (HTTPS), row-level security on the database, and hashed passwords. API keys are stored securely and can be revoked at any time.
        </p>

        <h2 style={S.h2}>7. Changes to This Policy</h2>
        <p style={S.p}>
          We may update this policy from time to time. We will notify you of significant changes via email. Continued use of the service after changes constitutes acceptance of the updated policy.
        </p>

        <h2 style={S.h2}>8. Contact</h2>
        <p style={S.p}>
          For any privacy-related questions or requests, contact us at{' '}
          <a href="mailto:pm.marine@admasol.com" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>pm.marine@admasol.com</a>.
        </p>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>&copy; {new Date().getFullYear()} ThreadLeads</span>
          <Link href="/terms" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms of Service &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
