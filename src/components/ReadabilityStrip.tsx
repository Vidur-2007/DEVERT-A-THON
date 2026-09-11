'use client';

import { useT } from '@/lib/i18n/strings';

interface ReadabilityStripProps {
  originalWordCount: number;
  simplifiedWordCount: number;
}

function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

// "Original: 8,400 words · ~45 min read → Here: 180 words · 1 min". SPEC.md Section 8.2 item 2.
export function ReadabilityStrip({ originalWordCount, simplifiedWordCount }: ReadabilityStripProps) {
  const t = useT();

  return (
    <p className="inline-block rounded-full bg-ink/5 px-4 py-2 text-sm text-slate">
      {t('original')}: {originalWordCount.toLocaleString('en-IN')} {t('words')} · ~{readingMinutes(originalWordCount)}{' '}
      {t('minRead')} {'→'} {t('here')}: {simplifiedWordCount.toLocaleString('en-IN')} {t('words')} ·{' '}
      {readingMinutes(simplifiedWordCount)} {t('minRead')}
    </p>
  );
}
