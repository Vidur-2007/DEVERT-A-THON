// Cross-scheme alternatives: same profile, evaluated against the whole library.
// See SPEC.md Section 6.6. Pure TypeScript: no React, no fetch, no LLM.

import type { CitizenProfile, Evaluation, Scheme, Verdict } from '../types';
import { evaluateScheme } from './evaluate';

const VERDICT_RANK: Record<Verdict, number> = {
  ELIGIBLE: 3,
  LIKELY_ELIGIBLE: 2,
  NEED_MORE_INFO: 1,
  NOT_ELIGIBLE: 0,
};

export interface AlternativeSuggestion {
  scheme: Scheme;
  evaluation: Evaluation;
  tagOverlap: number;
  topReasons: string[]; // up to 2 strongest passing criteria labels
}

function tagOverlapCount(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t)).length;
}

function topPassingLabels(evaluation: Evaluation, max = 2): string[] {
  const labels: string[] = [];
  for (const g of evaluation.groups) {
    for (const r of g.results) {
      if (r.status === 'PASS') labels.push(r.rule.label);
    }
  }
  for (const e of evaluation.exclusions) {
    if (e.status === 'PASS') labels.push(e.rule.label);
  }
  return labels.slice(0, max);
}

/**
 * Evaluates `profile` against every scheme in `library` (seeds + uploads),
 * drops NOT_ELIGIBLE, and ranks the rest by verdict, then matchScore, then
 * tag overlap with `currentSchemeId`. Returns the top `limit`.
 */
export function rankAlternatives(
  profile: CitizenProfile,
  library: Scheme[],
  currentSchemeId?: string,
  limit = 5,
): AlternativeSuggestion[] {
  const currentScheme = library.find((s) => s.id === currentSchemeId);
  const currentTags = currentScheme?.tags ?? [];

  const candidates: AlternativeSuggestion[] = library
    .filter((s) => s.id !== currentSchemeId)
    .map((scheme) => {
      const evaluation = evaluateScheme(scheme, profile);
      return {
        scheme,
        evaluation,
        tagOverlap: tagOverlapCount(scheme.tags, currentTags),
        topReasons: topPassingLabels(evaluation),
      };
    })
    .filter((c) => c.evaluation.verdict !== 'NOT_ELIGIBLE');

  candidates.sort((a, b) => {
    const verdictDiff = VERDICT_RANK[b.evaluation.verdict] - VERDICT_RANK[a.evaluation.verdict];
    if (verdictDiff !== 0) return verdictDiff;
    const scoreDiff = b.evaluation.matchScore - a.evaluation.matchScore;
    if (scoreDiff !== 0) return scoreDiff;
    return b.tagOverlap - a.tagOverlap;
  });

  return candidates.slice(0, limit);
}
