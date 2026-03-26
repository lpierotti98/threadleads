'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Thread } from '@/lib/types';
import MetricCards from '@/components/MetricCards';
import FilterBar from '@/components/FilterBar';
import ThreadCard from '@/components/ThreadCard';
import ReplyModal from '@/components/ReplyModal';
import UpgradePrompt from '@/components/UpgradePrompt';
import {
  Loader2,
  RefreshCw,
  Inbox,
  ArrowRight,
  Lightbulb,
  X,
} from 'lucide-react';
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
  const [showHint, setShowHint] = useState(true);

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
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {planName === 'starter' && (
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-indigo-600 text-white uppercase tracking-wider">
                Starter
              </span>
            )}
            {planName === 'pro' && (
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase tracking-wider">
                Pro
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {userEmail ? `Welcome back, ${userEmail.split('@')[0]}` : 'Buying intent threads from Reddit & Hacker News'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={scanDays}
            onChange={(e) => setScanDays(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 3 months</option>
          </select>
          <button
            onClick={handleScan}
            disabled={scanning || hasSubscription === false}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {scanning ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      {hasSubscription === false && <UpgradePrompt />}

      {/* Onboarding hint */}
      {showHint && threads.length === 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
          <Lightbulb size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-900">How ThreadLeads works</p>
            <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
              1. Add keywords in <Link href="/settings/keywords" className="underline font-semibold">Keywords settings</Link> describing what your customers search for.
              2. Click <strong>Scan Now</strong> to find threads with buying intent.
              3. Generate AI replies and post them to start conversations.
            </p>
          </div>
          <button onClick={() => setShowHint(false)} className="text-indigo-400 hover:text-indigo-600">
            <X size={16} />
          </button>
        </div>
      )}

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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 px-6 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox size={28} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No threads yet
            </h3>
            <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
              Add your keywords in settings, then hit Scan Now to discover threads
              where people are looking for solutions like yours.
            </p>
            <Link
              href="/settings/keywords"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-all"
            >
              Set up keywords
              <ArrowRight size={15} />
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
