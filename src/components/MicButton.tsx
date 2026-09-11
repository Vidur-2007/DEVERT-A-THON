'use client';

import { Mic } from 'lucide-react';
import { useT } from '@/lib/i18n/strings';

interface MicButtonProps {
  listening: boolean;
  onClick: () => void;
}

// Presentational only -- callers own the useSpeechInput() hook and decide whether to
// render this at all (feature-detected via `supported`, per SPEC 8.6: hide mic, no error).
export function MicButton({ listening, onClick }: MicButtonProps) {
  const t = useT();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={listening}
      aria-label={listening ? t('micListening') : t('micTapToSpeak')}
      title={listening ? t('micListening') : t('micTapToSpeak')}
      className={`no-print flex h-14 w-14 flex-none items-center justify-center rounded-full transition ${
        listening ? 'animate-pulse bg-sindoor text-white' : 'bg-marigold/15 text-marigold-ink hover:bg-marigold/25'
      }`}
    >
      <Mic size={24} aria-hidden="true" />
    </button>
  );
}
