'use client';

import type { Thread } from '@/lib/types';

interface Props {
  threads: Thread[];
}

export default function MetricCards({ threads }: Props) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeek = threads.filter((t) => new Date(t.created_at) >= weekAgo);
  const repliesGenerated = threads.filter((t) => t.reply_generated).length;
  const contacted = threads.filter((t) => t.marked_contacted).length;
  const avgScore = threads.length
    ? Math.round(threads.reduce((s, t) => s + t.score, 0) / threads.length)
    : 0;

  const metrics = [
    { label: 'threads / 7d', value: thisWeek.length },
    { label: 'replies', value: repliesGenerated },
    { label: 'contacted', value: contacted },
    { label: 'avg score', value: avgScore },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'var(--border)' }}>
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className="p-5 card-hover animate-fade-slide-in"
          style={{ background: 'var(--surface)', animationDelay: `${i * 80}ms` }}
        >
          <p className="font-mono text-3xl font-bold" style={{ color: 'var(--text)' }}>
            {m.value}
          </p>
          <p className="font-mono text-[11px] mt-1 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {m.label}
          </p>
        </div>
      ))}
    </div>
  );
}
