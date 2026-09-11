// Turns a FAILed numeric rule into a human hint. See SPEC.md Section 6.6.
// Pure TypeScript: no React, no fetch, no LLM.

import type { CitizenProfile, FieldKey, Rule } from '../types';

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function plural(n: number): string {
  return n === 1 ? 'year' : 'years';
}

function fieldLabel(field: FieldKey): string {
  // Small local map avoids a dependency on fields.ts (kept engine self-contained).
  const labels: Partial<Record<FieldKey, string>> = {
    annualFamilyIncome: 'family income',
    age: 'age',
    landHoldingAcres: 'land holding',
    monthlyPension: 'monthly pension',
    familySize: 'family size',
    disabilityPercent: 'disability percentage',
    numGirlChildrenUnder10: 'number of girls under 10',
  };
  return labels[field] ?? field;
}

/** Returns a plain-language near-miss hint for a FAILed numeric rule, or undefined. */
export function nearMiss(rule: Rule, profile: CitizenProfile): string | undefined {
  if (rule.field === 'custom') return undefined;
  const raw = profile[rule.field];
  if (typeof raw !== 'number') return undefined;

  if (rule.field === 'annualFamilyIncome' && (rule.operator === 'lte' || rule.operator === 'lt')) {
    if (typeof rule.value === 'number' && raw > rule.value) {
      return `Your family income is ${inr(raw - rule.value)} above the limit of ${inr(rule.value)}.`;
    }
    return undefined;
  }

  if (rule.field === 'age') {
    if (rule.operator === 'gte' && typeof rule.value === 'number' && raw < rule.value) {
      const years = Math.ceil(rule.value - raw);
      return `You will become eligible in ${years} ${plural(years)}.`;
    }
    if (rule.operator === 'lte' && typeof rule.value === 'number' && raw > rule.value) {
      const years = Math.floor(raw - rule.value);
      return `The age limit is ${rule.value}; you crossed it ${years} ${plural(years)} ago.`;
    }
    if (rule.operator === 'between' && typeof rule.value === 'number' && typeof rule.valueMax === 'number') {
      if (raw < rule.value) {
        const years = Math.ceil(rule.value - raw);
        return `You will become eligible in ${years} ${plural(years)}.`;
      }
      if (raw > rule.valueMax) {
        const years = Math.floor(raw - rule.valueMax);
        return `The age limit is ${rule.valueMax}; you crossed it ${years} ${plural(years)} ago.`;
      }
    }
    return undefined;
  }

  // Generic numeric near-miss for every other numeric field.
  const label = fieldLabel(rule.field);
  switch (rule.operator) {
    case 'lt':
    case 'lte':
      if (typeof rule.value === 'number' && raw > rule.value) {
        return `Your ${label} is ${raw - rule.value} above the limit of ${rule.value}.`;
      }
      return undefined;
    case 'gt':
    case 'gte':
      if (typeof rule.value === 'number' && raw < rule.value) {
        return `You need ${rule.value - raw} more to reach the required ${label} of ${rule.value}.`;
      }
      return undefined;
    case 'between':
      if (typeof rule.value === 'number' && typeof rule.valueMax === 'number') {
        if (raw < rule.value) return `Your ${label} is below the minimum of ${rule.value}.`;
        if (raw > rule.valueMax) return `Your ${label} is above the maximum of ${rule.valueMax}.`;
      }
      return undefined;
    default:
      return undefined;
  }
}
