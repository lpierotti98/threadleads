'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import type { Thread } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  thread: Thread;
  onClose: () => void;
}

export default function ReplyModal({ thread, onClose }: Props) {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [mentionProduct, setMentionProduct] = useState(false);
  const [productMentionText, setProductMentionText] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductMention() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('users_settings')
        .select('product_mention')
        .eq('user_id', user.id)
        .maybeSingle();
      setProductMentionText(data?.product_mention || null);
    }
    fetchProductMention();
  }, []);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: thread.id,
          title: thread.title,
          content: thread.content_preview,
          ...(mentionProduct && productMentionText && {
            productMention: productMentionText,
          }),
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setReply(data.reply);
        setGenerated(true);
      } else {
        setReply('Error generating reply. Please try again.');
      }
    } catch {
      setReply('Error generating reply. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
            Generate Reply
          </span>
          <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--text-primary)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
              Thread
            </p>
            <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{thread.title}</p>
            {thread.content_preview && (
              <p className="text-xs mt-1.5 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {thread.content_preview}
              </p>
            )}
          </div>

          {!generated && (
            <div className="space-y-3">
              {productMentionText && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mentionProduct}
                    onChange={(e) => setMentionProduct(e.target.checked)}
                    className="w-3.5 h-3.5"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    mention product at end
                  </span>
                </label>
              )}
              {!productMentionText && (
                <p className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  Set up a product mention in{' '}
                  <a href="/settings" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>settings</a>
                </p>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)', color: '#0e0e0f' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    generating...
                  </>
                ) : (
                  'generate reply'
                )}
              </button>
            </div>
          )}

          {generated && (
            <div className="space-y-3">
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Reply
              </p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={8}
                className="w-full border p-4 text-sm resize-y"
                style={{
                  background: 'var(--surface-el)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(reply);
                  window.open(thread.url, '_blank');
                }}
                className="w-full py-3 font-mono text-xs font-bold uppercase tracking-wider"
                style={{ background: 'var(--accent)', color: '#0e0e0f' }}
              >
                copy &amp; open thread
              </button>
              <p className="font-mono text-[10px] text-center" style={{ color: 'var(--text-secondary)' }}>
                Paste with Ctrl+V directly in the thread
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleCopy}
                  className="font-mono text-[11px] underline underline-offset-2 flex items-center gap-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {copied ? <><Check size={12} /> copied</> : <><Copy size={12} /> copy only</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
