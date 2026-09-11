'use client';

import { useState } from 'react';
import type { Scheme } from '@/lib/types';
import { useT, useTf } from '@/lib/i18n/strings';

interface DocChecklistProps {
  documents: Scheme['summary']['documents'];
}

// Interactive checklist: "I have this" toggles a readiness bar. SPEC.md Section 8.4 item 5.
export function DocChecklist({ documents }: DocChecklistProps) {
  const t = useT();
  const tf = useTf();
  const [have, setHave] = useState<Record<number, boolean>>({});

  const readyCount = documents.filter((_, i) => have[i]).length;
  const total = documents.length;
  const pct = total === 0 ? 0 : Math.round((readyCount / total) * 100);

  return (
    <div>
      <div className="mb-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-sm text-slate">{tf('readinessMeter', { ready: readyCount, total })}</p>
      </div>
      <ul className="space-y-2">
        {documents.map((doc, i) => (
          <li
            key={i}
            className="flex flex-col gap-2 rounded-lg border border-ink/10 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2">
              <span className="text-base text-ink">{doc.name}</span>
              {doc.mandatory && (
                <span className="mt-0.5 flex-none text-xs font-medium text-sindoor">{t('mandatory')}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setHave((h) => ({ ...h, [i]: !h[i] }))}
              aria-pressed={Boolean(have[i])}
              className={`no-print min-h-[40px] flex-none self-start rounded-full px-4 text-sm font-medium transition sm:self-auto ${
                have[i] ? 'bg-leaf text-white' : 'border border-ink/15 text-ink hover:border-leaf'
              }`}
            >
              {have[i] ? t('iHaveThisChecked') : t('iHaveThis')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
