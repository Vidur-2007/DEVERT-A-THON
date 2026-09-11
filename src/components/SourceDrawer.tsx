'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Quote, X } from 'lucide-react';
import { useT } from '@/lib/i18n/strings';

interface SourceDrawerProps {
  /** The plain-language criterion this quote backs, shown as the drawer title. */
  label: string;
  sourceQuote: string;
  verified?: boolean;
}

// Verbatim quote + automatic verification badge for one rule.
// Every eligibility/exclusion row links to one of these. See SPEC.md Section 8.2 and 7.2 step 8.
export function SourceDrawer({ label, sourceQuote, verified }: SourceDrawerProps) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('showSource')}
        title={t('showSource')}
        className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-slate hover:bg-ink/5 focus-visible:outline-none"
      >
        <Quote size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[560px] rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="font-heading text-lg font-semibold text-ink">{label}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="flex-none rounded-full p-1 text-slate hover:bg-ink/5 focus-visible:outline-none"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <blockquote className="rounded-lg border-l-4 border-marigold bg-paper p-3 text-base italic text-ink">
              &ldquo;{sourceQuote}&rdquo;
            </blockquote>

            <p
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                verified ? 'bg-leaf/10 text-leaf' : 'bg-haldi-bg text-haldi'
              }`}
            >
              {verified ? (
                <CheckCircle2 size={16} aria-hidden="true" />
              ) : (
                <AlertTriangle size={16} aria-hidden="true" />
              )}
              {verified ? t('verified') : t('checkManually')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
