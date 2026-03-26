'use client';

interface Props {
  scansUsed: number;
  scansLimit: number;
  repliesUsed: number;
  repliesLimit: number;
  plan: string | null;
}

function barColor(pct: number): string {
  if (pct >= 90) return 'var(--red)';
  if (pct >= 70) return 'var(--amber)';
  return 'var(--green)';
}

export default function UsageBar({
  scansUsed,
  scansLimit,
  repliesUsed,
  repliesLimit,
  plan,
}: Props) {
  if (!plan) return null;

  const scanPct = scansLimit > 0 ? Math.min(100, (scansUsed / scansLimit) * 100) : 0;
  const replyPct = repliesLimit > 0 ? Math.min(100, (repliesUsed / repliesLimit) * 100) : 0;

  return (
    <div
      className="flex flex-col sm:flex-row gap-4 p-4 border animate-fade-slide-in"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Scans today
          </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text)' }}>
            {scansUsed} / {scansLimit}
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${scanPct}%`, background: barColor(scanPct) }}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Replies this month
          </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text)' }}>
            {repliesUsed} / {repliesLimit}
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${replyPct}%`, background: barColor(replyPct) }}
          />
        </div>
      </div>
    </div>
  );
}
