// Template-only personalised explanation -- no LLM. See SPEC.md Section 7.3
// (EXPLAIN_SYSTEM) and 7.5 ("Template fallback ... so the result page never breaks").
// A pure function (no React) so /api/explain can reuse it as its LLM fallback.

import type { Lang } from './types';
import type { ExplainPayload } from './llm/prompts';
import { t, tf } from './i18n/strings';

export function buildTemplateExplanation(payload: ExplainPayload, lang: Lang): string {
  const parts: string[] = [];

  switch (payload.verdict) {
    case 'ELIGIBLE':
      parts.push(tf(lang, 'explainEligible', { scheme: payload.schemeName }));
      break;
    case 'LIKELY_ELIGIBLE':
      parts.push(tf(lang, 'explainLikely', { scheme: payload.schemeName }));
      break;
    case 'NEED_MORE_INFO':
      parts.push(tf(lang, 'explainNeedInfo', { scheme: payload.schemeName }));
      break;
    case 'NOT_ELIGIBLE':
      parts.push(tf(lang, 'explainNotEligible', { scheme: payload.schemeName }));
      break;
  }

  if (payload.verdict === 'ELIGIBLE' || payload.verdict === 'LIKELY_ELIGIBLE') {
    if (payload.passed.length > 0) {
      const list = payload.passed.slice(0, 2).join('; ');
      parts.push(tf(lang, 'explainReasonsMet', { list }));
    }
  } else if (payload.verdict === 'NOT_ELIGIBLE') {
    const leading = payload.failed[0];
    if (leading) {
      let sentence = tf(lang, 'explainMainReason', { reason: leading.label });
      if (leading.nearMiss) sentence += ` ${leading.nearMiss}`;
      parts.push(sentence);
    }
  }

  const unknownCount = payload.unknown.length;
  if (unknownCount > 0 && payload.verdict !== 'ELIGIBLE' && payload.verdict !== 'NOT_ELIGIBLE') {
    parts.push(tf(lang, 'explainNextMissing', { count: unknownCount }));
  } else if (payload.verdict === 'ELIGIBLE' || payload.verdict === 'LIKELY_ELIGIBLE') {
    parts.push(t(lang, 'explainNextDocuments'));
  }

  return parts.join(' ');
}
