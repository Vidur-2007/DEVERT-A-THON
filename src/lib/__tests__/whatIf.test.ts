import { describe, expect, it } from 'vitest';
import type { Rule } from '../types';
import { buildWhatIfSuggestion } from '../whatIf';

function rule(partial: Partial<Rule> & Pick<Rule, 'id' | 'field' | 'operator'>): Rule {
  return {
    label: partial.id,
    sourceQuote: 'source quote',
    confidence: 1,
    ...partial,
  };
}

describe('buildWhatIfSuggestion', () => {
  it('suggests the threshold for an lte failure (income too high)', () => {
    const r = rule({ id: 'r1', field: 'annualFamilyIncome', operator: 'lte', value: 250000 });
    const suggestion = buildWhatIfSuggestion(r, { annualFamilyIncome: 300000 });
    expect(suggestion).toEqual({ rule: r, field: 'annualFamilyIncome', value: 250000 });
  });

  it('suggests the threshold for a gte failure (age too low)', () => {
    const r = rule({ id: 'r1', field: 'age', operator: 'gte', value: 18 });
    const suggestion = buildWhatIfSuggestion(r, { age: 16 });
    expect(suggestion).toEqual({ rule: r, field: 'age', value: 18 });
  });

  it('suggests the nearer edge for a between failure', () => {
    const r = rule({ id: 'r1', field: 'age', operator: 'between', value: 18, valueMax: 40 });
    expect(buildWhatIfSuggestion(r, { age: 45 })?.value).toBe(40);
    expect(buildWhatIfSuggestion(r, { age: 10 })?.value).toBe(18);
  });

  it('returns null for a custom rule (no real profile field)', () => {
    const r = rule({ id: 'r1', field: 'custom', customKey: 'x', operator: 'is_true' });
    expect(buildWhatIfSuggestion(r, {})).toBeNull();
  });

  it('returns null when the profile value is missing or non-numeric', () => {
    const r = rule({ id: 'r1', field: 'annualFamilyIncome', operator: 'lte', value: 250000 });
    expect(buildWhatIfSuggestion(r, {})).toBeNull();
  });

  it('returns null for a non-numeric operator (e.g. is_true)', () => {
    const r = rule({ id: 'r1', field: 'age', operator: 'is_true' });
    expect(buildWhatIfSuggestion(r, { age: 25 })).toBeNull();
  });

  it('returns null for a between rule when the value is already inside range', () => {
    const r = rule({ id: 'r1', field: 'age', operator: 'between', value: 18, valueMax: 40 });
    expect(buildWhatIfSuggestion(r, { age: 25 })).toBeNull();
  });
});
