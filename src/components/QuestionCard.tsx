'use client';

import { ArrowLeft } from 'lucide-react';
import { useT } from '@/lib/i18n/strings';
import { ChoiceChips } from './ChoiceChips';
import { NumberQuickPick } from './NumberQuickPick';

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

// One question per screen, huge tap targets, "I don't know" always available. SPEC.md Section 8.3.
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

  return (
    <div className="mx-auto max-w-[560px] px-4 py-8">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate hover:text-ink focus-visible:outline-none"
        >
          <ArrowLeft size={16} aria-hidden="true" /> {t('back')}
        </button>
      )}

      <p className="mb-2 text-sm text-slate">{remainingLabel}</p>
      <h1 className="text-2xl font-semibold text-ink">{questionText}</h1>
      {helpText && <p className="mt-1 text-sm text-slate">{helpText}</p>}
      {sensitive && <p className="mt-1 text-xs text-slate">{t('staysOnYourPhone')}</p>}

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
          className="min-h-[48px] px-2 text-base font-medium text-slate underline hover:text-ink focus-visible:outline-none"
        >
          {t('iDontKnow')}
        </button>
        <button
          type="button"
          onClick={onShowResult}
          className="min-h-[48px] px-2 text-base font-medium text-marigold underline focus-visible:outline-none"
        >
          {t('showMyResultNow')}
        </button>
      </div>
    </div>
  );
}
