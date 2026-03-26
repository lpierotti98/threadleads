'use client';

import { Search, MessageSquare, UserCheck } from 'lucide-react';
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

  const metrics = [
    {
      label: 'Threads this week',
      value: thisWeek.length,
      icon: Search,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Replies generated',
      value: repliesGenerated,
      icon: MessageSquare,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Leads contacted',
      value: contacted,
      icon: UserCheck,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
        >
          <div className={`p-3 rounded-lg ${m.color}`}>
            <m.icon size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold">{m.value}</p>
            <p className="text-sm text-gray-500">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
