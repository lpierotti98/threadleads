'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Thread } from '@/lib/types';
import MetricCards from '@/components/MetricCards';
import FilterBar from '@/components/FilterBar';
import ThreadCard from '@/components/ThreadCard';
import ReplyModal from '@/components/ReplyModal';
import UpgradePrompt from '@/components/UpgradePrompt';
import { Loader2, RefreshCw } from 'lucide-react';

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

  const supabase = createClient();

  const fetchThreads = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

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
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {planName === 'starter' && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-600 text-white">
                Starter
              </span>
            )}
            {planName === 'pro' && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                Pro
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Threads with buying intent from Reddit and Hacker News
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={scanDays}
            onChange={(e) => setScanDays(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 3 months</option>
          </select>
          <button
            onClick={handleScan}
            disabled={scanning || hasSubscription === false}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {scanning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {scanning ? 'Scanning...' : 'Scan Now'}
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

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">No threads found</p>
            <p className="text-sm mt-1">
              Add keywords in Settings, then click &quot;Scan Now&quot; to find threads.
            </p>
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
