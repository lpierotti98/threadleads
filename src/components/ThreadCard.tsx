'use client';

import { ExternalLink } from 'lucide-react';
import type { Thread } from '@/lib/types';

interface Props {
  thread: Thread;
  onGenerateReply: (thread: Thread) => void;
  onMarkDone: (id: string) => void;
  onMarkContacted: (id: string) => void;
  index?: number;
}

function urgencyColor(urgency: string) {
  const c: Record<string, string> = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--green)' };
  return c[urgency] || c.low;
}

function sourceColor(source: string) {
  return source === 'reddit' ? '#ff4500' : '#ff6600';
}

export default function ThreadCard({
  thread,
  onGenerateReply,
  onMarkDone,
  onMarkContacted,
  index = 0,
}: Props) {
  const timeAgo = getTimeAgo(thread.created_at);

  return (
    <div
      className="border-l-[3px] border p-5 card-hover animate-fade-slide-in"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        borderLeftColor: urgencyColor(thread.urgency),
        opacity: thread.marked_done ? 0.4 : undefined,
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-widest"
              style={{ color: sourceColor(thread.source) }}
            >
              {thread.source === 'reddit' ? 'reddit' : 'hn'}
            </span>
            {thread.subreddit && (
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                r/{thread.subreddit}
              </span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: urgencyColor(thread.urgency) }}>
              {thread.urgency}
            </span>
            <span className="font-mono text-[10px] ml-auto" style={{ color: 'var(--text-secondary)' }}>
              {timeAgo}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="font-mono text-2xl font-bold leading-none flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>
              {thread.score}
            </span>
            <div className="min-w-0">
              <a
                href={thread.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-base leading-snug hover:underline underline-offset-2 inline-flex items-center gap-1.5"
                style={{ color: 'var(--text)' }}
              >
                {thread.title}
                <ExternalLink size={12} className="flex-shrink-0 opacity-30" />
              </a>
              <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {thread.score_reason}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 font-mono text-[11px]">
          <button
            onClick={() => onGenerateReply(thread)}
            disabled={thread.marked_done}
            className="underline-offset-2 hover:underline disabled:opacity-30 transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            generate
          </button>
          <button
            onClick={() => onMarkContacted(thread.id)}
            disabled={thread.marked_contacted}
            className="underline-offset-2 hover:underline disabled:opacity-30 transition-colors"
            style={{ color: thread.marked_contacted ? 'var(--green)' : 'var(--text-secondary)' }}
          >
            {thread.marked_contacted ? 'contacted' : 'contact'}
          </button>
          <button
            onClick={() => onMarkDone(thread.id)}
            disabled={thread.marked_done}
            className="underline-offset-2 hover:underline disabled:opacity-30 transition-colors"
            style={{ color: thread.marked_done ? 'var(--green)' : 'var(--text-secondary)' }}
          >
            done
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
