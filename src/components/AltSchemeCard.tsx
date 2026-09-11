import Link from 'next/link';
import type { AlternativeSuggestion } from '@/lib/engine';
import { useT } from '@/lib/i18n/strings';
import { VERDICT_META } from '@/lib/verdictMeta';

interface AltSchemeCardProps {
  suggestion: AlternativeSuggestion;
}

// One alternative scheme: name, verdict chip, benefit, 2 reasons, "Open". SPEC.md Section 8.4 item 7.
export function AltSchemeCard({ suggestion }: AltSchemeCardProps) {
  const t = useT();
  const { scheme, evaluation, topReasons } = suggestion;
  const meta = VERDICT_META[evaluation.verdict];
  const Icon = meta.Icon;

  return (
    <div className="flex w-72 flex-none flex-col gap-2 rounded-2xl border border-ink/10 bg-white p-4">
      <span
        className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.bgClass} ${meta.textClass}`}
      >
        <Icon size={12} aria-hidden="true" /> {t(meta.labelKey)}
      </span>
      <p className="font-heading text-base font-semibold text-ink">{scheme.name}</p>
      <p className="text-sm text-slate">{scheme.summary.oneLiner}</p>
      {topReasons.length > 0 && (
        <ul className="text-xs text-slate">
          {topReasons.map((reason, i) => (
            <li key={i}>• {reason}</li>
          ))}
        </ul>
      )}
      <Link
        href={`/scheme/${scheme.id}`}
        className="mt-2 inline-flex min-h-[40px] items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-paper"
      >
        {t('open')}
      </Link>
    </div>
  );
}
