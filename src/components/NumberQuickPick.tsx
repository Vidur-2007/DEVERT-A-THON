'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/strings';

interface NumberQuickPickProps {
  quickPicks: { value: number; label: string }[];
  onSelect: (value: number) => void;
}

// Tap-able number chips plus a numeric keypad fallback. SPEC.md Section 6.2 / 8.3.
export function NumberQuickPick({ quickPicks, onSelect }: NumberQuickPickProps) {
  const t = useT();
  const [manual, setManual] = useState('');
  const manualValue = Number(manual);
  const manualIsValid = manual.trim() !== '' && !Number.isNaN(manualValue);

  return (
    <div>
      {quickPicks.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickPicks.map((qp) => (
            <button
              key={qp.value}
              type="button"
              onClick={() => onSelect(qp.value)}
              className="flex min-h-[56px] items-center justify-center rounded-2xl border border-ink/15 bg-white px-3 text-center text-base font-medium text-ink transition hover:border-marigold hover:text-marigold-ink"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder={t('otherAmount')}
          aria-label={t('otherAmount')}
          className="min-h-[56px] flex-1 rounded-2xl border border-ink/15 bg-white px-4 text-lg text-ink focus-visible:border-marigold"
        />
        <button
          type="button"
          disabled={!manualIsValid}
          onClick={() => manualIsValid && onSelect(manualValue)}
          className="min-h-[56px] flex-none rounded-2xl bg-ink px-5 text-base font-semibold text-paper disabled:opacity-40"
        >
          {t('continueLabel')}
        </button>
      </div>
    </div>
  );
}
