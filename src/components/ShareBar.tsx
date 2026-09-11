'use client';

import { MessageCircle, Printer, RotateCcw } from 'lucide-react';
import { useT, useTf } from '@/lib/i18n/strings';

interface ShareBarProps {
  schemeName: string;
  oneLiner: string;
  verdictLabel: string;
  onStartAgain: () => void;
}

// Share on WhatsApp (plain-text summary, no personal data), print/save as PDF, start
// again. SPEC.md Section 8.4 item 8. Hidden when printing (.no-print) -- its buttons
// don't do anything useful on paper.
export function ShareBar({ schemeName, oneLiner, verdictLabel, onStartAgain }: ShareBarProps) {
  const t = useT();
  const tf = useTf();

  function handleShare() {
    // The current page URL carries no personal data (the profile lives only in
    // localStorage), so it's safe to include -- it invites the recipient to check
    // for themselves rather than exposing the sender's own answers.
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = tf('shareSummary', { scheme: schemeName, verdict: verdictLabel, oneLiner, url });
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="no-print mb-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="flex min-h-[48px] items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-sm font-medium text-ink transition hover:border-leaf hover:text-leaf"
      >
        <MessageCircle size={16} aria-hidden="true" /> {t('shareOnWhatsApp')}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex min-h-[48px] items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-sm font-medium text-ink transition hover:border-marigold"
      >
        <Printer size={16} aria-hidden="true" /> {t('printSaveAsPdf')}
      </button>
      <button
        type="button"
        onClick={onStartAgain}
        className="flex min-h-[48px] items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-sm font-medium text-ink transition hover:border-sindoor hover:text-sindoor"
      >
        <RotateCcw size={16} aria-hidden="true" /> {t('startAgain')}
      </button>
    </div>
  );
}
