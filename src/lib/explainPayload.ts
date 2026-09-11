// Builds the anonymised payload sent to /api/explain (and used as the template's input).
// No profile values ever appear here -- only rule labels and the verdict -- so nothing
// that could identify anyone leaves the browser. See SPEC.md Section 7.3 EXPLAIN_SYSTEM.

import type { Evaluation, Rule, Scheme } from './types';
import type { AlternativeSuggestion } from './engine';
import type { ExplainPayload } from './llm/prompts';

export function buildExplainPayload(
  scheme: Scheme,
  evaluation: Evaluation,
  alternatives: AlternativeSuggestion[] = [],
  /** Resolves a rule to its display label -- pass useTranslatedScheme's labelFor to get
   * translated reasons in the template fallback; defaults to the rule's English label. */
  labelFor: (rule: Rule) => string = (rule) => rule.label,
): ExplainPayload {
  const allResults = [...evaluation.groups.flatMap((g) => g.results), ...evaluation.exclusions];
  const passed = allResults
    .filter((r) => r.status === 'PASS' && r.kind === 'eligibility')
    .map((r) => labelFor(r.rule));

  // Exclusions first: an exclusion hit is always the more specific/decisive reason to lead with.
  const failedExclusions = allResults.filter((r) => r.status === 'FAIL' && r.kind === 'exclusion');
  const failedEligibility = allResults.filter((r) => r.status === 'FAIL' && r.kind === 'eligibility');
  const failed = [...failedExclusions, ...failedEligibility].map((r) => ({
    label: labelFor(r.rule),
    nearMiss: r.nearMiss,
  }));

  const unknown = allResults.filter((r) => r.status === 'UNKNOWN').map((r) => labelFor(r.rule));

  return {
    schemeName: scheme.name,
    verdict: evaluation.verdict,
    passed,
    failed,
    unknown,
    documentGaps: scheme.documentGaps,
    topAlternatives: alternatives.slice(0, 3).map((a) => a.scheme.name),
  };
}
