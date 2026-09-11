// "What if my income was ₹2 lakh?" chips. See SPEC.md Section 8.4 item 4: for a FAILed
// numeric rule, suggests the threshold value that would flip it to PASS. Pure logic
// (no React) -- the actual re-evaluation just calls the engine's evaluateScheme with a
// scratch profile; nothing here ever touches the citizen's real profile.

import type { CitizenProfile, FieldKey, Rule } from './types';

export interface WhatIfSuggestion {
  rule: Rule;
  field: FieldKey;
  /** The value that would make this rule pass, given how it currently fails. */
  value: number;
}

function flipValue(rule: Rule, raw: number): number | null {
  switch (rule.operator) {
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
      return typeof rule.value === 'number' ? rule.value : null;
    case 'between': {
      if (typeof rule.value !== 'number' || typeof rule.valueMax !== 'number') return null;
      if (raw < rule.value) return rule.value;
      if (raw > rule.valueMax) return rule.valueMax;
      return null; // already inside the range -- rule wasn't the reason for failing
    }
    default:
      return null;
  }
}

/** Builds a what-if suggestion for one FAILed rule, or null if it isn't a numeric
 * comparison on a real profile field (e.g. enum/boolean rules, or custom questions). */
export function buildWhatIfSuggestion(rule: Rule, profile: CitizenProfile): WhatIfSuggestion | null {
  if (rule.field === 'custom') return null;
  const raw = profile[rule.field];
  if (typeof raw !== 'number') return null;
  const value = flipValue(rule, raw);
  if (value === null) return null;
  return { rule, field: rule.field, value };
}
