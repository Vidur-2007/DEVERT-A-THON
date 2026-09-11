'use client';

import { useId } from 'react';
import type { Verdict } from '@/lib/types';
import { useT } from '@/lib/i18n/strings';
import { VERDICT_META } from '@/lib/verdictMeta';

interface VerdictStampProps {
  verdict: Verdict;
}

// The signature visual: a circular ink-stamp seal. SPEC.md Section 9.4.
// Double ring, verdict word curved along the top, big icon centre, -8deg rotation,
// one-time "stamp" settle animation (respects prefers-reduced-motion globally).
export function VerdictStamp({ verdict }: VerdictStampProps) {
  const t = useT();
  const noiseId = useId();
  const arcId = useId();
  const meta = VERDICT_META[verdict];
  const { Icon } = meta;
  const label = t(meta.labelKey);

  return (
    <div className="flex flex-col items-center">
      <div className="-rotate-[8deg]">
        <div className="animate-stamp-in relative h-44 w-44">
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <path id={arcId} d="M 22,100 A 78,78 0 0 1 178,100" fill="none" />
              <filter id={noiseId}>
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
              </filter>
            </defs>

            {/* Double ring */}
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              className={meta.ringClass}
              strokeWidth={meta.ring === 'filled' ? 4 : 3}
              strokeDasharray={meta.ring === 'outline' ? '7 5' : undefined}
              opacity={meta.ring === 'filled' ? 1 : 0.7}
            />
            <circle cx="100" cy="100" r="78" fill="none" className={meta.ringClass} strokeWidth="2" opacity="0.45" />
            {meta.ring === 'filled' && (
              <circle cx="100" cy="100" r="68" className={meta.fillClass} stroke="none" opacity="0.08" />
            )}

            {/* Verdict word, curved along the top of the ring */}
            <text fontSize="15" fontWeight="700" letterSpacing="2.5" className={`${meta.fillClass} uppercase`}>
              <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                {label}
              </textPath>
            </text>

            {/* Subtle ink texture */}
            <rect width="200" height="200" filter={`url(#${noiseId})`} />
          </svg>

          <div className={`absolute inset-0 flex items-center justify-center ${meta.textClass}`}>
            <Icon size={56} strokeWidth={2.5} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Text + icon, never colour alone (SPEC 9.5) -- this restates the stamp in plain copy. */}
      <p className={`mt-3 flex items-center gap-1.5 text-lg font-semibold ${meta.textClass}`}>
        <Icon size={18} aria-hidden="true" /> {label}
      </p>
    </div>
  );
}
