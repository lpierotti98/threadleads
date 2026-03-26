'use client';

import { ExternalLink, Check, MessageSquare, Phone } from 'lucide-react';
import type { Thread } from '@/lib/types';

interface Props {
  thread: Thread;
  onGenerateReply: (thread: Thread) => void;
  onMarkDone: (id: string) => void;
  onMarkContacted: (id: string) => void;
}

function scoreBorderColor(score: number) {
  if (score >= 80) return 'border-l-emerald-500';
  if (score >= 60) return 'border-l-amber-500';
  return 'border-l-gray-300';
}

function scoreBadgeColor(score: number) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700';
  if (score >= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

function urgencyBadge(urgency: string) {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-gray-100 text-gray-600',
  };
  return colors[urgency] || colors.low;
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
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${scoreBorderColor(
        thread.score
      )} p-5 transition-all hover:shadow-md ${
        thread.marked_done ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
              {thread.source === 'reddit' ? 'Reddit' : 'HN'}
            </span>
            {thread.subreddit && (
              <span className="text-xs text-gray-500">
                r/{thread.subreddit}
              </span>
            )}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBadgeColor(
                thread.score
              )}`}
            >
              {thread.score}/100
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${urgencyBadge(
                thread.urgency
              )}`}
            >
              {thread.urgency}
            </span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          <a
            href={thread.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
          >
            {thread.title}
            <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
          </a>
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
            {thread.score_reason}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onGenerateReply(thread)}
            disabled={thread.marked_done}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MessageSquare size={14} />
            Generate Reply
          </button>
          <button
            onClick={() => onMarkContacted(thread.id)}
            disabled={thread.marked_contacted}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              thread.marked_contacted
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Phone size={14} />
            {thread.marked_contacted ? 'Contacted' : 'Contacted'}
          </button>
          <button
            onClick={() => onMarkDone(thread.id)}
            disabled={thread.marked_done}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              thread.marked_done
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Check size={14} />
            {thread.marked_done ? 'Done' : 'Done'}
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
