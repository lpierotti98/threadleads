'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Thread } from '@/lib/types';
import MetricCards from '@/components/MetricCards';
import FilterBar from '@/components/FilterBar';
import ThreadCard from '@/components/ThreadCard';
import ReplyModal from '@/components/ReplyModal';
import UpgradePrompt from '@/components/UpgradePrompt';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import { useToast } from '@/components/Toast';
import { Loader2 } from 'lucide-react';
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
  const [hasKeywords, setHasKeywords] = useState(false);
  const [hasProductMention, setHasProductMention] = useState(false);
  const { toast } = useToast();

  const supabase = createClient();

  const fetchThreads = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
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

    async function loadState() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').maybeSingle();
      setHasSubscription(!!sub);
      setPlanName(sub?.plan || null);

      const { data: settings } = await supabase.from('users_settings').select('keywords, product_mention').eq('user_id', user.id).maybeSingle();
      setHasKeywords((settings?.keywords?.length || 0) > 0);
      setHasProductMention(!!settings?.product_mention);
    }
    loadState();
  }, [fetchThreads, supabase]);

  async function handleScan() {
    setScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: scanDays }),
      });
      const data = await res.json();
      await fetchThreads();
      toast(`Scan complete — ${data.saved || 0} threads saved`, 'success');
    } catch {
      toast('Scan failed', 'error');
    } finally {
      setScanning(false);
    }
  }

  async function handleMarkDone(id: string) {
    await supabase.from('threads').update({ marked_done: true }).eq('id', id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, marked_done: true } : t)));
  }

  async function handleMarkContacted(id: string) {
    await supabase.from('threads').update({ marked_contacted: true }).eq('id', id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, marked_contacted: true } : t)));
  }

  const filtered = threads.filter((t) => {
    if (source !== 'all' && t.source !== source) return false;
    if (t.score < minScore) return false;
    if (keyword && !t.title.toLowerCase().includes(keyword.toLowerCase()) && !t.content_preview?.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const hasScanned = threads.length > 0;
  const hasReplied = threads.some((t) => t.reply_generated);

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
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
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
            className="font-mono text-xs px-3 py-2.5 border rounded-sm"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value={1}>24h</option>
            <option value={7}>7d</option>
            <option value={30}>30d</option>
            <option value={90}>90d</option>
          </select>
          <button
            onClick={handleScan}
            disabled={scanning || hasSubscription === false}
            className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 disabled:opacity-30 transition-all"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {scanning ? 'scanning...' : 'scan now'}
          </button>
        </div>
      </div>

      {hasSubscription === false && <UpgradePrompt />}

      <OnboardingChecklist
        hasKeywords={hasKeywords}
        hasScanned={hasScanned}
        hasReplied={hasReplied}
        hasProductMention={hasProductMention}
      />

      <MetricCards threads={threads} />
      <FilterBar source={source} setSource={setSource} minScore={minScore} setMinScore={setMinScore} keyword={keyword} setKeyword={setKeyword} />

      <div className="space-y-px" style={{ background: 'var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="py-20 px-6 text-center animate-fade-slide-in" style={{ background: 'var(--surface)' }}>
            {/* SVG illustration */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 opacity-30">
              <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }} />
              <path d="M8 20h48M24 30h16M20 38h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-secondary)' }} />
            </svg>
            <p className="font-serif text-xl mb-1" style={{ color: 'var(--text)' }}>No threads yet</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Add keywords, then scan to discover buying intent.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/settings/keywords"
                className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-colors"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                add keywords
              </Link>
              <button
                onClick={handleScan}
                disabled={scanning || !hasKeywords}
                className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 border disabled:opacity-30 transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                {scanning ? 'scanning...' : 'scan now'}
              </button>
            </div>
          </div>
        ) : (
          filtered.map((thread, i) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onGenerateReply={setSelectedThread}
              onMarkDone={handleMarkDone}
              onMarkContacted={handleMarkContacted}
              index={i}
            />
          ))
        )}
      </div>

      {selectedThread && (
        <ReplyModal
          thread={selectedThread}
          onClose={() => { setSelectedThread(null); fetchThreads(); }}
        />
      )}
    </div>
  );
}
