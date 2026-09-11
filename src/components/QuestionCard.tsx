'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/lib/i18n/useLang';
import { useT, useTf } from '@/lib/i18n/strings';
import { useSpeechInput } from '@/lib/speech/useSpeechInput';
import { matchSpokenAnswer } from '@/lib/speech/matchAnswer';
import { ChoiceChips } from './ChoiceChips';
import { NumberQuickPick } from './NumberQuickPick';
import { MicButton } from './MicButton';

interface QuestionCardProps {
  questionText: string;
  helpText?: string;
  sensitive?: boolean;
  type: 'boolean' | 'enum' | 'number';
  options?: { value: string; label: string }[];
  quickPicks?: { value: number; label: string }[];
  onAnswer: (value: string | number | boolean) => void;
  onDontKnow: () => void;
  onBack?: () => void;
  onShowResult: () => void;
  remainingLabel: string;
}

// One question per screen, huge tap targets, "I don't know" always available, mic on
// every question. SPEC.md Section 8.3 and 10. Render with `key={questionText}` from the
// caller so moving to a new question resets local state (mic, unmatched transcript) for free.
export function QuestionCard({
  questionText,
  helpText,
  sensitive,
  type,
  options,
  quickPicks,
  onAnswer,
  onDontKnow,
  onBack,
  onShowResult,
  remainingLabel,
}: QuestionCardProps) {
  const t = useT();
  const tf = useTf();
  const { lang } = useLang();
  const [unmatched, setUnmatched] = useState<string | null>(null);

  function handleFinalTranscript(text: string) {
    const result = matchSpokenAnswer(text, type, options);
    if (result.matched) {
      setUnmatched(null);
      onAnswer(result.value);
    } else {
      setUnmatched(text);
    }
  }

  const {
    supported: micSupported,
    listening,
    transcript,
    start,
    stop,
    error: micError,
  } = useSpeechInput(lang, handleFinalTranscript);

  return (
    <div className="mx-auto max-w-[560px] px-4 py-8">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" /> {t('back')}
        </button>
      )}

      <p className="mb-2 text-sm text-slate">{remainingLabel}</p>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink">{questionText}</h1>
        {micSupported && (
          <MicButton listening={listening} onClick={() => (listening ? stop() : start())} />
        )}
      </div>
      {helpText && <p className="mt-1 text-sm text-slate">{helpText}</p>}
      {sensitive && <p className="mt-1 text-xs text-slate">{t('staysOnYourPhone')}</p>}

      {listening && (
        <p className="mt-3 text-sm text-marigold-ink">
          {transcript ? tf('weHeard', { transcript }) : t('micListening')}
        </p>
      )}
      {!listening && unmatched && (
        <div className="mt-3 rounded-lg bg-haldi-bg p-3 text-sm text-haldi-ink" role="status">
          <p>{tf('weHeard', { transcript: unmatched })}</p>
          <p className="mt-1">{t('didntUnderstand')}</p>
        </div>
      )}
      {!listening && !unmatched && micError && (
        <p className="mt-3 text-sm text-haldi-ink" role="status">
          {t('voiceInputError')}
        </p>
      )}

      <div className="mt-6">
        {type === 'boolean' && (
          <ChoiceChips
            options={[
              { value: 'yes', label: t('yes') },
              { value: 'no', label: t('no') },
            ]}
            onSelect={(v) => onAnswer(v === 'yes')}
          />
        )}
        {type === 'enum' && options && <ChoiceChips options={options} onSelect={onAnswer} />}
        {type === 'number' && <NumberQuickPick quickPicks={quickPicks ?? []} onSelect={onAnswer} />}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onDontKnow}
          className="min-h-[48px] px-2 text-base font-medium text-slate underline hover:text-ink"
        >
          {t('iDontKnow')}
        </button>
        <button
          type="button"
          onClick={onShowResult}
          className="min-h-[48px] px-2 text-base font-medium text-marigold-ink underline"
        >
          {t('showMyResultNow')}
        </button>
      </div>
    </div>
  );
}
