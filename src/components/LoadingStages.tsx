'use client';

import { useEffect, useState } from 'react';
import { useT, type StringKey } from '@/lib/i18n/strings';

// Staged loading messages while /api/extract runs. SPEC.md Section 8.6.
const STAGE_KEYS: StringKey[] = ['stageReading', 'stageFindingRules', 'stageCheckingRules', 'stageSimplifying'];
const STAGE_INTERVAL_MS = 1800;

export function LoadingStages() {
  const t = useT();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, STAGE_KEYS.length - 1));
    }, STAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-[420px] py-16 text-center" role="status" aria-live="polite">
      <div
        className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-ink/15 border-t-marigold"
        aria-hidden="true"
      />
      <ul className="space-y-2 text-left">
        {STAGE_KEYS.map((key, i) => (
          <li key={key} className={`flex items-center gap-2 text-base ${i <= index ? 'text-ink' : 'text-slate/50'}`}>
            <span className={`h-2 w-2 flex-none rounded-full ${i <= index ? 'bg-marigold' : 'bg-ink/15'}`} aria-hidden="true" />
            {t(key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
