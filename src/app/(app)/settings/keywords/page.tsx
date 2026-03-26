'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Loader2 } from 'lucide-react';
import type { Keyword } from '@/lib/types';
import { useToast } from '@/components/Toast';

const KEYWORD_LIMITS: Record<string, number> = { starter: 5, pro: 10 };

export default function KeywordsPage() {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [plan, setPlan] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('users_settings')
        .select('keywords')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.keywords) setKeywords(data.keywords);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      setPlan(sub?.plan || null);

      setLoading(false);
    }
    load();
  }, [supabase]);

  async function save(updated: Keyword[]) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('users_settings').upsert({ user_id: user.id, keywords: updated }, { onConflict: 'user_id' });
    setSaving(false);
    toast('Keywords saved', 'success');
  }

  const maxKeywords = plan ? (KEYWORD_LIMITS[plan] || 5) : 5;
  const atLimit = keywords.length >= maxKeywords;

  function addKeyword(text: string) {
    const trimmed = text.trim();
    if (!trimmed || atLimit) return;
    if (keywords.some((k) => k.text.toLowerCase() === trimmed.toLowerCase())) return;
    const updated = [...keywords, { text: trimmed, active: true }];
    setKeywords(updated);
    setSuggestions((prev) => prev.filter((s) => s !== text));
    save(updated);
  }

  function handleAdd() { addKeyword(newKeyword); setNewKeyword(''); }

  function handleRemove(index: number) {
    const updated = keywords.filter((_, i) => i !== index);
    setKeywords(updated);
    save(updated);
  }

  function handleToggle(index: number) {
    const updated = keywords.map((k, i) => i === index ? { ...k, active: !k.active } : k);
    setKeywords(updated);
    save(updated);
  }

  async function handleGenerate() {
    if (!description.trim()) return;
    setGenerating(true);
    setSuggestions([]);
    try {
      const res = await fetch('/api/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        toast(data.error, 'error');
      } else if (Array.isArray(data.keywords)) {
        setSuggestions(data.keywords);
      }
    } catch { /* retry manually */ } finally { setGenerating(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>
          Keywords
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {keywords.length} / {maxKeywords} keywords used{plan ? ` (${plan.charAt(0).toUpperCase() + plan.slice(1)})` : ''}
        </p>
      </div>

      {/* AI Generator */}
      <div className="border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          AI keyword generator
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Describe your product or service..."
            className="flex-1 border px-4 py-2.5 text-sm"
            style={{ background: 'var(--surface-el)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !description.trim()}
            className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 disabled:opacity-30 flex items-center gap-2"
            style={{ background: 'var(--accent)', color: '#0e0e0f' }}
          >
            {generating ? <><Loader2 size={13} className="animate-spin" /> generating...</> : 'generate'}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
              Click to add ({keywords.length}/{maxKeywords})
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => {
                const added = keywords.some((k) => k.text.toLowerCase() === s.toLowerCase());
                return (
                  <button
                    key={s}
                    onClick={() => addKeyword(s)}
                    disabled={added || keywords.length >= maxKeywords}
                    className="font-mono text-[11px] px-3 py-1.5 border disabled:opacity-30 transition-colors"
                    style={{
                      background: added ? 'var(--surface-el)' : 'transparent',
                      borderColor: added ? 'var(--green)' : 'var(--border)',
                      color: added ? 'var(--green)' : 'var(--text-primary)',
                    }}
                  >
                    {added ? '+ ' : '+ '}{s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Manual add */}
      <div className="border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          Add manually
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder='e.g. "AI customer support tool"'
            maxLength={100}
            className="flex-1 border px-4 py-2.5 text-sm"
            style={{ background: 'var(--surface-el)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={handleAdd}
            disabled={!newKeyword.trim() || keywords.length >= maxKeywords}
            className="font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 disabled:opacity-30"
            style={{ background: 'var(--accent)', color: '#0e0e0f' }}
          >
            add
          </button>
        </div>
      </div>

      {/* Keyword list */}
      <div>
        {keywords.length === 0 ? (
          <div className="border py-12 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              No keywords yet
            </p>
          </div>
        ) : (
          <div className="space-y-px" style={{ background: 'var(--border)' }}>
            {keywords.map((kw, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3"
                style={{ background: 'var(--surface)' }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(i)}
                    className="w-8 h-4 relative rounded-full transition-colors"
                    style={{ background: kw.active ? 'var(--accent)' : 'var(--border)' }}
                  >
                    <span
                      className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
                      style={{
                        background: kw.active ? '#0e0e0f' : 'var(--text-secondary)',
                        left: kw.active ? '18px' : '2px',
                      }}
                    />
                  </button>
                  <span
                    className="text-sm"
                    style={{ color: kw.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {kw.text}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(i)}
                  className="opacity-30 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--red)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="font-mono text-[10px] mt-3" style={{ color: 'var(--text-secondary)' }}>
          {keywords.length}/{maxKeywords} keywords{saving ? ' — saving...' : ''}
        </p>
        {atLimit && (
          <div className="mt-3 p-3 border-l-2 animate-fade-slide-in" style={{ background: 'var(--surface-el)', borderLeftColor: 'var(--amber)' }}>
            <p className="text-xs" style={{ color: 'var(--text)' }}>
              Keyword limit reached for your plan.
              {plan === 'starter' && (
                <> <a href="/pricing" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>Upgrade to Pro</a> for up to 10 keywords.</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
