'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SettingsPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [usage, setUsage] = useState({ scans_today: 0, replies_this_month: 0 });
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

      const { data: u } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (u) setUsage(u);
    }
    load();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y">
        <div className="p-5">
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="text-sm mt-1">{email}</p>
        </div>

        <div className="p-5">
          <p className="text-sm font-medium text-gray-500 mb-3">Subscription</p>
          {plan ? (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold capitalize">{plan}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                  Active
                </span>
              </div>
              <Link
                href="/pricing"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Manage subscription
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-sm text-gray-500">No active plan</span>
              <Link
                href="/pricing"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View plans
              </Link>
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-sm font-medium text-gray-500">Usage</p>
          <div className="text-sm mt-1 space-y-1">
            <p>Scans today: {usage.scans_today}</p>
            <p>Replies this month: {usage.replies_this_month}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
