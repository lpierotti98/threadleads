'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePrompt() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-7 text-white shadow-xl shadow-indigo-600/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      <div className="relative flex items-start gap-5">
        <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">
            Unlock the full power of ThreadLeads
          </h3>
          <p className="text-indigo-100 text-sm mt-1.5 leading-relaxed max-w-lg">
            Start scanning Reddit and Hacker News for high-intent threads. Generate
            expert replies that turn conversations into inbound leads.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 bg-white text-indigo-600 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-black/10"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
