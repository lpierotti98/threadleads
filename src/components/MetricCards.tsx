'use client';

import { Search, MessageSquare, UserCheck, TrendingUp } from 'lucide-react';
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
    {
      label: 'Threads this week',
      value: thisWeek.length,
      icon: Search,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      label: 'Replies generated',
      value: repliesGenerated,
      icon: MessageSquare,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Leads contacted',
      value: contacted,
      icon: UserCheck,
      iconColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
    },
    {
      label: 'Avg. intent score',
      value: avgScore,
      icon: TrendingUp,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className={`bg-white rounded-xl border ${m.borderColor} p-5 shadow-sm card-hover`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${m.bgColor}`}>
              <m.icon size={18} className={m.iconColor} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{m.value}</p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">{m.label}</p>
        </div>
      ))}
    </div>
  );
}
