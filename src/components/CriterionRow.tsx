'use client';

import { Check, HelpCircle, X, type LucideIcon } from 'lucide-react';
import type { Status } from '@/lib/types';
import { useT } from '@/lib/i18n/strings';
import { SourceDrawer } from './SourceDrawer';

interface CriterionRowProps {
  label: string;
  status: Status;
  kind?: 'eligibility' | 'exclusion';
  nearMiss?: string;
  sourceQuote?: string;
  verified?: boolean;
  /** Compact mode: icon + label only, no near-miss/source/exclusion tag. Used in the live
   * wizard CriteriaPanel. Full mode (default) is used in the Result breakdown. */
  compact?: boolean;
  /** When set on an UNKNOWN row, the whole row becomes tappable ("tap to answer inline"). */
  onTapUnknown?: () => void;
}

const STATUS_STYLE: Record<Status, { Icon: LucideIcon; color: string; bg: string }> = {
  PASS: { Icon: Check, color: 'text-leaf', bg: 'bg-leaf/10' },
  FAIL: { Icon: X, color: 'text-sindoor', bg: 'bg-sindoor/10' },
  UNKNOWN: { Icon: HelpCircle, color: 'text-haldi', bg: 'bg-haldi-bg' },
};

const STATUS_SR_KEY: Record<Status, 'srMet' | 'srNotMet' | 'srUnknown'> = {
  PASS: 'srMet',
  FAIL: 'srNotMet',
  UNKNOWN: 'srUnknown',
};

export function CriterionRow({
  label,
  status,
  kind,
  nearMiss,
  sourceQuote,
  verified,
  compact = false,
  onTapUnknown,
}: CriterionRowProps) {
  const t = useT();
  const { Icon, color, bg } = STATUS_STYLE[status];
  const clickable = status === 'UNKNOWN' && Boolean(onTapUnknown);

  const row = (
    <div className={`flex items-start gap-3 rounded-lg p-3 ${compact ? '' : 'border border-ink/10 bg-white'}`}>
      <span className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full ${bg} ${color}`}>
        <Icon size={14} aria-hidden="true" />
      </span>
      <span className="flex-1 text-base text-ink">
        <span className="sr-only">{t(STATUS_SR_KEY[status])}: </span>
        {label}
        {kind === 'exclusion' && !compact && (
          <span className="ml-2 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-xs text-slate">
            {t('exclusionTag')}
          </span>
        )}
        {nearMiss && !compact && <span className="mt-1 block text-sm text-slate">{nearMiss}</span>}
      </span>
      {!compact && sourceQuote && (
        <SourceDrawer label={label} sourceQuote={sourceQuote} verified={verified} variant="link" />
      )}
    </div>
  );

  if (clickable) {
    return (
      <button type="button" onClick={onTapUnknown} className="w-full text-left focus-visible:outline-none">
        {row}
      </button>
    );
  }
  return row;
}
