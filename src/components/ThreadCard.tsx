'use client';

import { ExternalLink, Check, MessageSquare, Phone } from 'lucide-react';
import type { Thread } from '@/lib/types';

interface Props {
  thread: Thread;
  onGenerateReply: (thread: Thread) => void;
  onMarkDone: (id: string) => void;
  onMarkContacted: (id: string) => void;
}

function urgencyBorderColor(urgency: string) {
  const colors: Record<string, string> = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-400',
    low: 'border-l-emerald-400',
  };
  return colors[urgency] || colors.low;
}

function scoreBadge(score: number) {
  if (score >= 80) return 'bg-emerald-500 text-white';
  if (score >= 60) return 'bg-amber-500 text-white';
  if (score >= 40) return 'bg-orange-400 text-white';
  return 'bg-gray-400 text-white';
}

function urgencyBadge(urgency: string) {
  const colors: Record<string, string> = {
    high: 'bg-red-50 text-red-600 ring-1 ring-red-200',
    medium: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
    low: 'bg-gray-50 text-gray-500 ring-1 ring-gray-200',
  };
  return colors[urgency] || colors.low;
}

function sourceBadge(source: string) {
  if (source === 'reddit') return 'bg-orange-600 text-white';
  return 'bg-amber-500 text-white';
}

export default function ThreadCard({
  thread,
  onGenerateReply,
  onMarkDone,
  onMarkContacted,
}: Props) {
  const timeAgo = getTimeAgo(thread.created_at);

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 border-l-4 ${urgencyBorderColor(
        thread.urgency
      )} p-5 card-hover shadow-sm ${
        thread.marked_done ? 'opacity-40' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${sourceBadge(
                thread.source
              )}`}
            >
              {thread.source === 'reddit' ? 'Reddit' : 'HN'}
            </span>
            {thread.subreddit && (
              <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                r/{thread.subreddit}
              </span>
            )}
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${scoreBadge(
                thread.score
              )}`}
            >
              {thread.score}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${urgencyBadge(
                thread.urgency
              )}`}
            >
              {thread.urgency}
            </span>
            <span className="text-[11px] text-gray-400 ml-auto flex-shrink-0">
              {timeAgo}
            </span>
          </div>

          <a
            href={thread.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5 leading-snug"
          >
            {thread.title}
            <ExternalLink
              size={13}
              className="text-gray-300 flex-shrink-0"
            />
          </a>

          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {thread.score_reason}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onGenerateReply(thread)}
            disabled={thread.marked_done}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
          >
            <MessageSquare size={13} />
            Generate Reply
          </button>
          <button
            onClick={() => onMarkContacted(thread.id)}
            disabled={thread.marked_contacted}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              thread.marked_contacted
                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 ring-1 ring-gray-200'
            }`}
          >
            <Phone size={13} />
            {thread.marked_contacted ? 'Contacted' : 'Contact'}
          </button>
          <button
            onClick={() => onMarkDone(thread.id)}
            disabled={thread.marked_done}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              thread.marked_done
                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 ring-1 ring-gray-200'
            }`}
          >
            <Check size={13} />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
