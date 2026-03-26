'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Check,
  Mail,
  CreditCard,
  MessageSquare,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export default function SettingsPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [usage, setUsage] = useState({ scans_today: 0, replies_this_month: 0 });
  const [productMention, setProductMention] = useState('');
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      setPlan(sub?.plan || null);

      const { data: settings } = await supabase
        .from('users_settings')
        .select('product_mention')
        .eq('user_id', user.id)
        .maybeSingle();
      if (settings?.product_mention) {
        setProductMention(settings.product_mention);
      }

      const { data: u } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (u) setUsage(u);
    }
    load();
  }, [supabase]);

  async function handleSaveProductMention() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('users_settings')
      .upsert(
        { user_id: user.id, product_mention: productMention.trim() || null },
        { onConflict: 'user_id' }
      );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your account, subscription, and preferences
        </p>
      </div>

      {/* Account */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Mail size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Account
          </h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Email address
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">{email}</p>
        </div>
      </section>

      {/* Subscription */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Subscription
          </h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          {plan ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <CreditCard size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 capitalize">
                      {plan} Plan
                    </p>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {plan === 'starter' ? '$199/month' : '$399/month'}
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Manage
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <CreditCard size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    No active plan
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Subscribe to unlock scanning and reply generation
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-all"
              >
                View plans
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Product Mention */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Product Mention
          </h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            When you toggle &quot;Mention product&quot; in the reply generator,
            this text will be included at the end of the AI reply.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={productMention}
              onChange={(e) => setProductMention(e.target.value)}
              placeholder="e.g. Acme (acme.com) - helps sales teams automate outreach"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
            <button
              onClick={handleSaveProductMention}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-all"
            >
              {saved ? (
                <>
                  <Check size={14} />
                  Saved
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Usage
          </h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-5">
              <p className="text-2xl font-bold text-gray-900">
                {usage.scans_today}
              </p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Scans today
              </p>
            </div>
            <div className="p-5">
              <p className="text-2xl font-bold text-gray-900">
                {usage.replies_this_month}
              </p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Replies this month
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
