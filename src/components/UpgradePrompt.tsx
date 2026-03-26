'use client';

import Link from 'next/link';

export default function UpgradePrompt() {
  return (
    <div
      className="border p-6"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <p className="font-serif text-lg" style={{ color: 'var(--text-primary)' }}>
        Unlock ThreadLeads
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
        Subscribe to start scanning forums and generating replies.
      </p>
      <Link
        href="/pricing"
        className="inline-block mt-4 px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider"
        style={{ background: 'var(--accent)', color: '#0e0e0f' }}
      >
        View Plans
      </Link>
    </div>
  );
}
