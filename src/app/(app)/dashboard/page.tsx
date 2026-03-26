'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Thread } from '@/lib/types';
import MetricCards from '@/components/MetricCards';
import FilterBar from '@/components/FilterBar';
import ThreadCard from '@/components/ThreadCard';
import ReplyModal from '@/components/ReplyModal';
import UpgradePrompt from '@/components/UpgradePrompt';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [source, setSource] = useState('all');
  const [minScore, setMinScore] = useState(60);
  const [keyword, setKeyword] = useState('');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [scanDays, setScanDays] = useState(7);
  const [userEmail, setUserEmail] = useState('');

  const supabase = createClient();

  const fetchThreads = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email || '');

    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('[dashboard:fetchThreads] error:', error, 'rows:', data?.length ?? 0, 'data:', data);

    setThreads((data as Thread[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchThreads();

    async function checkSub() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      setHasSubscription(!!data);
      setPlanName(data?.plan || null);
    }
    checkSub();
  }, [fetchThreads, supabase]);

  async function handleScan() {
    setScanning(true);
    try {
      await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: scanDays }),
      });
      await fetchThreads();
    } finally {
      setScanning(false);
    }
  }

  async function handleMarkDone(id: string) {
    await supabase.from('threads').update({ marked_done: true }).eq('id', id);
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, marked_done: true } : t))
    );
  }

  async function handleMarkContacted(id: string) {
    await supabase
      .from('threads')
      .update({ marked_contacted: true })
      .eq('id', id);
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, marked_contacted: true } : t))
    );
  }

  const filtered = threads.filter((t) => {
    if (source !== 'all' && t.source !== source) return false;
    if (t.score < minScore) return false;
    if (
      keyword &&
      !t.title.toLowerCase().includes(keyword.toLowerCase()) &&
      !t.content_preview?.toLowerCase().includes(keyword.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
              Signal Feed
            </span>
            <span className="w-1.5 h-1.5 rounded-full blink" style={{ background: 'var(--green)' }} />
            {planName && (
              <span
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border"
                style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
              >
                {planName}
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {userEmail ? `${userEmail.split('@')[0]}` : 'buying intent from reddit & hn'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={scanDays}
            onChange={(e) => setScanDays(Number(e.target.value))}
            className="font-mono text-xs px-3 py-2.5 border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value={1}>24h</option>
            <option value={7}>7d</option>
            <option value={30}>30d</option>
            <option value={90}>90d</option>
          </select>
          <button
            onClick={handleScan}
            disabled={scanning || hasSubscription === false}
            className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 disabled:opacity-30 transition-colors"
            style={{ background: 'var(--accent)', color: '#0e0e0f' }}
          >
            {scanning ? 'scanning...' : 'scan now'}
          </button>
        </div>
      </div>

      {hasSubscription === false && <UpgradePrompt />}

      <MetricCards threads={threads} />

      <FilterBar
        source={source}
        setSource={setSource}
        minScore={minScore}
        setMinScore={setMinScore}
        keyword={keyword}
        setKeyword={setKeyword}
      />

      <div className="space-y-px" style={{ background: 'var(--border)' }}>
        {filtered.length === 0 ? (
          <div
            className="py-20 px-6 text-center"
            style={{ background: 'var(--surface)' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-secondary)' }}>
              No signals
            </p>
            <p className="font-serif text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
              No threads found yet
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Add keywords, then scan to discover buying intent.
            </p>
            <Link
              href="/settings/keywords"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5"
              style={{ background: 'var(--accent)', color: '#0e0e0f' }}
            >
              set up keywords
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          filtered.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onGenerateReply={setSelectedThread}
              onMarkDone={handleMarkDone}
              onMarkContacted={handleMarkContacted}
            />
          ))
        )}
      </div>

      {selectedThread && (
        <ReplyModal
          thread={selectedThread}
          onClose={() => {
            setSelectedThread(null);
            fetchThreads();
          }}
        />
      )}
    </div>
  );
}
