'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Evaluation } from '@/lib/types';
import { useT } from '@/lib/i18n/strings';
import { CriterionRow } from './CriterionRow';

interface CriteriaPanelProps {
  evaluation: Evaluation;
}

// Live reasoning panel: each criterion flips ? -> PASS/FAIL as answers come in.
// Collapsible on mobile, sticky sidebar on desktop. SPEC.md Section 8.3.
export function CriteriaPanel({ evaluation }: CriteriaPanelProps) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const rows = [
    ...evaluation.groups.flatMap((g) =>
      g.results.map((r) => ({ key: r.rule.id, label: r.rule.label, status: r.status })),
    ),
    ...evaluation.exclusions.map((r) => ({ key: r.rule.id, label: r.rule.label, status: r.status })),
  ];

  return (
    <aside className="rounded-2xl border border-ink/10 bg-white p-4 lg:sticky lg:top-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-base font-semibold text-ink lg:pointer-events-none"
      >
        {t('liveCriteriaHeading')}
        <ChevronDown
          size={18}
          className={`transition-transform lg:hidden ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <div aria-live="polite" className={`${open ? 'mt-3 block' : 'hidden'} space-y-1 lg:mt-3 lg:block`}>
        {rows.map((r) => (
          <CriterionRow key={r.key} label={r.label} status={r.status} compact />
        ))}
      </div>
    </aside>
  );
}
