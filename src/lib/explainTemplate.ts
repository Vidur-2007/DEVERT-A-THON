// Template-only personalised explanation -- no LLM. See SPEC.md Section 7.3
// (EXPLAIN_SYSTEM) and 7.5 ("Template fallback ... so the result page never breaks").
// A pure function (no React) so /api/explain can reuse it as its LLM fallback in Phase 4.

import type { Evaluation, Lang, RuleResult, Scheme } from './types';
import { t, tf } from './i18n/strings';

function allResults(evaluation: Evaluation): RuleResult[] {
  return [...evaluation.groups.flatMap((g) => g.results), ...evaluation.exclusions];
}

export function buildTemplateExplanation(scheme: Scheme, evaluation: Evaluation, lang: Lang): string {
  const results = allResults(evaluation);
  const passedEligibility = results.filter((r) => r.status === 'PASS' && r.kind === 'eligibility');
  const failedEligibility = results.filter((r) => r.status === 'FAIL' && r.kind === 'eligibility');
  const failedExclusions = results.filter((r) => r.status === 'FAIL' && r.kind === 'exclusion');
  const unknownCount = evaluation.missingFields.length + evaluation.missingCustom.length;

  const parts: string[] = [];

  switch (evaluation.verdict) {
    case 'ELIGIBLE':
      parts.push(tf(lang, 'explainEligible', { scheme: scheme.name }));
      break;
    case 'LIKELY_ELIGIBLE':
      parts.push(tf(lang, 'explainLikely', { scheme: scheme.name }));
      break;
    case 'NEED_MORE_INFO':
      parts.push(tf(lang, 'explainNeedInfo', { scheme: scheme.name }));
      break;
    case 'NOT_ELIGIBLE':
      parts.push(tf(lang, 'explainNotEligible', { scheme: scheme.name }));
      break;
  }

  if (evaluation.verdict === 'ELIGIBLE' || evaluation.verdict === 'LIKELY_ELIGIBLE') {
    if (passedEligibility.length > 0) {
      const list = passedEligibility.slice(0, 2).map((r) => r.rule.label).join('; ');
      parts.push(tf(lang, 'explainReasonsMet', { list }));
    }
  } else if (evaluation.verdict === 'NOT_ELIGIBLE') {
    // An exclusion hit is always the more specific/decisive reason to lead with.
    const leading = failedExclusions[0] ?? failedEligibility[0];
    if (leading) {
      let sentence = tf(lang, 'explainMainReason', { reason: leading.rule.label });
      if (leading.nearMiss) sentence += ` ${leading.nearMiss}`;
      parts.push(sentence);
    }
  }

  if (unknownCount > 0 && evaluation.verdict !== 'ELIGIBLE' && evaluation.verdict !== 'NOT_ELIGIBLE') {
    parts.push(tf(lang, 'explainNextMissing', { count: unknownCount }));
  } else if (evaluation.verdict === 'ELIGIBLE' || evaluation.verdict === 'LIKELY_ELIGIBLE') {
    parts.push(t(lang, 'explainNextDocuments'));
  }

  return parts.join(' ');
}
