'use client';

import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePrompt() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <Zap size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Upgrade to unlock ThreadLeads</h3>
          <p className="text-indigo-100 text-sm mt-1">
            You need an active subscription to scan threads and generate replies.
            Start with the Starter plan at $199/month.
          </p>
          <Link
            href="/pricing"
            className="inline-block mt-4 px-5 py-2 bg-white text-indigo-600 font-semibold text-sm rounded-lg hover:bg-indigo-50 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
