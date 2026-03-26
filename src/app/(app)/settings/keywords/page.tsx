'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Loader2, Sparkles } from 'lucide-react';
import type { Keyword } from '@/lib/types';

const MAX_KEYWORDS = 10;

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('users_settings')
        .select('keywords')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.keywords) {
        setKeywords(data.keywords);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function save(updated: Keyword[]) {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('users_settings')
      .upsert(
        { user_id: user.id, keywords: updated },
        { onConflict: 'user_id' }
      );
    setSaving(false);
  }

  function addKeyword(text: string) {
    const trimmed = text.trim();
    if (!trimmed || keywords.length >= MAX_KEYWORDS) return;
    if (keywords.some((k) => k.text.toLowerCase() === trimmed.toLowerCase()))
      return;
    const updated = [...keywords, { text: trimmed, active: true }];
    setKeywords(updated);
    setSuggestions((prev) => prev.filter((s) => s !== text));
    save(updated);
  }

  function handleAdd() {
    addKeyword(newKeyword);
    setNewKeyword('');
  }

  function handleRemove(index: number) {
    const updated = keywords.filter((_, i) => i !== index);
    setKeywords(updated);
    save(updated);
  }

  function handleToggle(index: number) {
    const updated = keywords.map((k, i) =>
      i === index ? { ...k, active: !k.active } : k
    );
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
      if (Array.isArray(data.keywords)) {
        setSuggestions(data.keywords);
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Keywords</h1>
        <p className="text-sm text-gray-500">
          Add up to {MAX_KEYWORDS} topics to monitor on Reddit and Hacker News
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Describe your product or service
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. AI tool for sales teams, SaaS for freelancers, marketing agency"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !description.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all whitespace-nowrap"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {generating ? 'Generating...' : 'Generate keywords with AI'}
            </button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              Click to add ({keywords.length}/{MAX_KEYWORDS} slots used)
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => {
                const alreadyAdded = keywords.some(
                  (k) => k.text.toLowerCase() === s.toLowerCase()
                );
                return (
                  <button
                    key={s}
                    onClick={() => addKeyword(s)}
                    disabled={alreadyAdded || keywords.length >= MAX_KEYWORDS}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      alreadyAdded
                        ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {alreadyAdded ? '\u2713 ' : '+ '}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Or add manually
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder='e.g. "AI customer support tool"'
              maxLength={100}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={
                !newKeyword.trim() || keywords.length >= MAX_KEYWORDS
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {keywords.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            No keywords yet. Generate some with AI or add manually above.
          </p>
        ) : (
          <div className="space-y-2">
            {keywords.map((kw, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(i)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      kw.active ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        kw.active ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm ${
                      kw.active ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {kw.text}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(i)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          {keywords.length}/{MAX_KEYWORDS} keywords used
          {saving && ' — Saving...'}
        </p>
      </div>
    </div>
  );
}
