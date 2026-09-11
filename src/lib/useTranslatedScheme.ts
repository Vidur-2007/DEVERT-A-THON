'use client';

// On-demand scheme content translation: English canonical, translated on first switch
// to another language, then cached (server LRU + this browser's localStorage).
// See SPEC.md Section 10 ("Scheme content ... via /api/translate on first switch, cached")
// and 7.4 fallback ("Show English + 'Translation unavailable right now'").

import { useEffect, useMemo, useState } from 'react';
import type { Rule, Scheme } from './types';
import { useLang } from './i18n/useLang';
import { getCachedTranslation, setCachedTranslation } from './translateCache';
import type { TranslatableContent } from './llm/schema';

function collectRuleLabels(scheme: Scheme): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const group of scheme.eligibility) {
    for (const rule of group.rules) labels[rule.id] = rule.label;
  }
  for (const rule of scheme.exclusions) labels[rule.id] = rule.label;
  return labels;
}

const EMPTY_SUMMARY: Scheme['summary'] = {
  oneLiner: '',
  whatIsIt: '',
  benefits: [],
  whoCanApply: [],
  notFor: [],
  documents: [],
  howToApply: [],
  applyMode: 'unknown',
};
const EMPTY_CONTENT: TranslatableContent = { ...EMPTY_SUMMARY, ruleLabels: {} };

export interface TranslatedScheme {
  summary: Scheme['summary'];
  /** Translated criterion label for one rule, falling back to its English label. */
  labelFor: (rule: Rule) => string;
  /** True while a translation is being fetched (English content is shown meanwhile). */
  loading: boolean;
  /** True if translation was attempted and failed -- English is shown, note it in the UI. */
  unavailable: boolean;
}

/** `scheme` may be undefined while it's still resolving (see useSchemeById) -- this hook
 * must still be called unconditionally (Rules of Hooks), so it degrades gracefully then. */
export function useTranslatedScheme(scheme: Scheme | undefined): TranslatedScheme {
  const { lang } = useLang();
  const englishRuleLabels = useMemo(() => (scheme ? collectRuleLabels(scheme) : {}), [scheme]);
  const english: TranslatableContent = useMemo(
    () => (scheme ? { ...scheme.summary, ruleLabels: englishRuleLabels } : EMPTY_CONTENT),
    [scheme, englishRuleLabels],
  );

  const [content, setContent] = useState<TranslatableContent>(english);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    // Every setState call in this block is a one-time sync driven by `lang`/`scheme`
    // changing (localStorage/pre-baked lookups, or "show English while we wait" before
    // the fetch below) -- not state derived from props on every render.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!scheme || lang === 'en') {
      setContent(english);
      setUnavailable(false);
      setLoading(false);
      return;
    }

    // 1. Pre-baked translation shipped with the scheme (none of our seeds have one yet,
    //    but a future scripts/build-seeds.ts run could add these -- SPEC 7.5).
    const preBaked = scheme.translations?.[lang];
    if (preBaked) {
      const { ruleLabels, ...summary } = preBaked;
      setContent({ ...summary, ruleLabels });
      setUnavailable(false);
      setLoading(false);
      return;
    }

    // 2. This browser's cache.
    const cached = getCachedTranslation(scheme.id, lang);
    if (cached) {
      setContent(cached);
      setUnavailable(false);
      setLoading(false);
      return;
    }

    // 3. Ask the server. Show English while we wait -- never block the page.
    let cancelled = false;
    setContent(english);
    setUnavailable(false);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeId: scheme.id, payload: english, lang }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { payload?: TranslatableContent; source?: string } | null) => {
        if (cancelled || !data?.payload) {
          setUnavailable(true);
          return;
        }
        if (data.source === 'llm') {
          setContent(data.payload);
          setCachedTranslation(scheme.id, lang, data.payload);
        } else {
          // Route already fell back to English for us; just flag it for the UI.
          setUnavailable(true);
        }
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, scheme, english]);

  const labelFor = useMemo(() => {
    const { ruleLabels } = content;
    return (rule: Rule) => ruleLabels[rule.id] ?? rule.label;
  }, [content]);

  const summary: Scheme['summary'] = useMemo(
    () => ({
      oneLiner: content.oneLiner,
      whatIsIt: content.whatIsIt,
      benefits: content.benefits,
      whoCanApply: content.whoCanApply,
      notFor: content.notFor,
      documents: content.documents,
      howToApply: content.howToApply,
      applyMode: content.applyMode,
      officialUrl: content.officialUrl,
      helpline: content.helpline,
      deadline: content.deadline,
    }),
    [content],
  );

  return { summary, labelFor, loading, unavailable };
}
