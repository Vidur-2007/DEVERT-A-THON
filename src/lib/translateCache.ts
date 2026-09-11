// Client-side cache for translated scheme content, keyed by scheme + language, so a
// translation is only ever fetched once per browser. See SPEC.md Section 7.5.

import type { Lang } from './types';
import type { TranslatableContent } from './llm/schema';

const PREFIX = 'ys:translate:';

export function getCachedTranslation(schemeId: string, lang: Lang): TranslatableContent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${schemeId}:${lang}`);
    if (!raw) return null;
    return JSON.parse(raw) as TranslatableContent;
  } catch {
    return null;
  }
}

export function setCachedTranslation(schemeId: string, lang: Lang, content: TranslatableContent): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${PREFIX}${schemeId}:${lang}`, JSON.stringify(content));
  } catch {
    // Storage full or blocked - the translation just won't be cached this session.
  }
}
