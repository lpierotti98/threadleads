'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, X } from 'lucide-react';
import Link from 'next/link';

interface Props {
  hasKeywords: boolean;
  hasScanned: boolean;
  hasReplied: boolean;
  hasProductMention: boolean;
}

export default function OnboardingChecklist({
  hasKeywords,
  hasScanned,
  hasReplied,
  hasProductMention,
}: Props) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem('onboarding-dismissed') === 'true');
  }, []);

  const allDone = hasKeywords && hasScanned && hasReplied && hasProductMention;
  if (dismissed || allDone) return null;

  function dismiss() {
    localStorage.setItem('onboarding-dismissed', 'true');
    setDismissed(true);
  }

  const steps = [
    { done: hasKeywords, label: 'Add your first keyword', href: '/settings/keywords' },
    { done: hasScanned, label: 'Run your first scan', href: null },
    { done: hasReplied, label: 'Generate your first reply', href: null },
    { done: hasProductMention, label: 'Set up your product mention', href: '/settings' },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div
      className="border p-5 animate-fade-slide-in"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
            Getting Started
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>
            {doneCount}/{steps.length} steps completed
          </p>
        </div>
        <button
          onClick={dismiss}
          className="opacity-40 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full mb-4" style={{ background: 'var(--border)' }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{
            background: 'var(--accent)',
            width: `${(doneCount / steps.length) * 100}%`,
          }}
        />
      </div>

      <div className="space-y-2.5">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            {step.done ? (
              <CheckCircle size={16} style={{ color: 'var(--green)' }} />
            ) : (
              <Circle size={16} style={{ color: 'var(--border)' }} />
            )}
            {step.href && !step.done ? (
              <Link
                href={step.href}
                className="text-sm underline underline-offset-2"
                style={{ color: step.done ? 'var(--text-secondary)' : 'var(--accent)' }}
              >
                {step.label}
              </Link>
            ) : (
              <span
                className="text-sm"
                style={{
                  color: step.done ? 'var(--text-secondary)' : 'var(--text)',
                  textDecoration: step.done ? 'line-through' : 'none',
                }}
              >
                {step.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
