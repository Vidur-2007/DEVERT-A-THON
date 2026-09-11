// Adaptive question selection: ask the most decisive unanswered question first.
// See SPEC.md Section 6.5. Pure TypeScript: no React, no fetch, no LLM.

import type { CitizenProfile, FieldKey, Rule, Scheme } from '../types';
import { getFieldDef } from '../fields';
import { customWeightInScheme, evaluateScheme, fieldWeightInScheme } from './evaluate';

export type NextQuestion =
  | { kind: 'field'; field: FieldKey; score: number }
  | { kind: 'custom'; customKey: string; question: string; score: number };

function typeCost(type: 'boolean' | 'enum' | 'number'): number {
  // Ties -> cheaper question first (boolean < enum < number).
  return type === 'boolean' ? 0 : type === 'enum' ? 1 : 2;
}

function findCustomRule(scheme: Scheme, customKey: string): Rule | undefined {
  for (const group of scheme.eligibility) {
    for (const rule of group.rules) {
      if (rule.field === 'custom' && rule.customKey === customKey) return rule;
    }
  }
  for (const rule of scheme.exclusions) {
    if (rule.field === 'custom' && rule.customKey === customKey) return rule;
  }
  return undefined;
}

function customQuestionText(rule: Rule | undefined, fallback: string): string {
  if (!rule || !rule.customQuestion) return fallback;
  if (typeof rule.customQuestion === 'string') return rule.customQuestion;
  return rule.customQuestion.en ?? fallback;
}

/**
 * Picks the single best next question for `scheme`, given what's already known
 * about `profile`. `library` (defaults to just this scheme) is used for the
 * "other schemes that also use this field" bonus, which helps the /discover flow.
 * Returns null once the verdict is decided or nothing is left to ask.
 */
export function nextQuestion(
  scheme: Scheme,
  profile: CitizenProfile,
  library: Scheme[] = [scheme],
): NextQuestion | null {
  const evaluation = evaluateScheme(scheme, profile);
  if (evaluation.verdict === 'ELIGIBLE' || evaluation.verdict === 'NOT_ELIGIBLE') return null;

  let best: (NextQuestion & { cost: number }) | null = null;

  for (const field of evaluation.missingFields) {
    const inScheme = fieldWeightInScheme(field, scheme);
    const otherSchemes = library.filter((s) => s.id !== scheme.id && fieldWeightInScheme(field, s) > 0).length;
    const score = inScheme + 0.5 * otherSchemes;
    const cost = typeCost(getFieldDef(field).type);
    if (!best || score > best.score || (score === best.score && cost < best.cost)) {
      best = { kind: 'field', field, score, cost };
    }
  }

  for (const customKey of evaluation.missingCustom) {
    const inScheme = customWeightInScheme(customKey, scheme);
    const otherSchemes = library.filter(
      (s) => s.id !== scheme.id && customWeightInScheme(customKey, s) > 0,
    ).length;
    const score = inScheme + 0.5 * otherSchemes;
    const cost = 0; // yes/no is always the cheapest question type
    if (!best || score > best.score || (score === best.score && cost < best.cost)) {
      const rule = findCustomRule(scheme, customKey);
      const question = customQuestionText(rule, customKey);
      best = { kind: 'custom', customKey, question, score, cost };
    }
  }

  if (!best) return null;
  if (best.kind === 'field') return { kind: 'field', field: best.field, score: best.score };
  return { kind: 'custom', customKey: best.customKey, question: best.question, score: best.score };
}
