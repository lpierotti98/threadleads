'use client';

import { useState } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import type { Thread } from '@/lib/types';

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
          ...(mentionProduct && {
            productMention:
              'ThreadLeads (threadleads-b445.vercel.app) - monitors Reddit and HN for buying intent signals and generates expert AI replies to get inbound leads',
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-lg">Generate Reply</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Thread
            </p>
            <p className="text-sm font-semibold">{thread.title}</p>
            {thread.content_preview && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                {thread.content_preview}
              </p>
            )}
          </div>

          {!generated && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Expert Reply with AI'
              )}
            </button>
          )}

          {generated && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Generated Reply
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy to clipboard
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mentionProduct}
                  onChange={(e) => setMentionProduct(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-500">
                  Mention ThreadLeads at the end
                </span>
              </label>
              <p className="text-xs text-gray-400">
                Edit the reply above before copying. Make it your own.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
