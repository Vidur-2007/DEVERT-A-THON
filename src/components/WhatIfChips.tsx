'use client';

import { useState } from 'react';
import type { CitizenProfile, Rule, Scheme, Verdict } from '@/lib/types';
import { evaluateScheme } from '@/lib/engine';
import { getFieldDef } from '@/lib/fields';
import { formatQuickPickLabel } from '@/lib/format';
import { useLang } from '@/lib/i18n/useLang';
import { useT, useTf } from '@/lib/i18n/strings';
import { VERDICT_META } from '@/lib/verdictMeta';
import type { WhatIfSuggestion } from '@/lib/whatIf';

interface WhatIfChipsProps {
  scheme: Scheme;
  profile: CitizenProfile;
  suggestions: WhatIfSuggestion[];
  /** Translated criterion label, from useTranslatedScheme -- see explainPayload.ts for the same pattern. */
  labelFor: (rule: Rule) => string;
}

// "What if my income was ₹2 lakh?" -- re-evaluates a scratch profile instantly, never
// touching (or saving) the citizen's real one. SPEC.md Section 8.4 item 4.
export function WhatIfChips({ scheme, profile, suggestions, labelFor }: WhatIfChipsProps) {
  const { lang } = useLang();
  const t = useT();
  const tf = useTf();
  const [results, setResults] = useState<Record<string, Verdict>>({});

  if (suggestions.length === 0) return null;

  function handleTry(suggestion: WhatIfSuggestion) {
    // A scratch copy -- `profile` itself is never mutated or saved.
    const scratchProfile: CitizenProfile = { ...profile, [suggestion.field]: suggestion.value };
    const evaluation = evaluateScheme(scheme, scratchProfile);
    setResults((prev) => ({ ...prev, [suggestion.rule.id]: evaluation.verdict }));
  }

  return (
    <section className="no-print mb-6">
      <h2 className="mb-3 text-xl font-semibold text-ink">{t('whatIfHeading')}</h2>
      <div className="flex flex-wrap gap-3">
        {suggestions.map((suggestion) => {
          const def = getFieldDef(suggestion.field);
          const valueLabel = formatQuickPickLabel(suggestion.value, def.unit, lang);
          const verdict = results[suggestion.rule.id];
          const meta = verdict ? VERDICT_META[verdict] : null;
          return (
            <div key={suggestion.rule.id} className="flex flex-col gap-1">
              <p className="text-sm text-slate">{labelFor(suggestion.rule)}</p>
              <button
                type="button"
                onClick={() => handleTry(suggestion)}
                className="min-h-[48px] rounded-full border border-ink/15 bg-white px-4 text-base text-ink transition hover:border-marigold"
              >
                {tf('tryThisValue', { value: valueLabel })}
              </button>
              {meta && (
                <p className={`text-sm font-medium ${meta.textClass}`}>
                  {tf('whatIfResult', { verdict: t(meta.labelKey) })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
