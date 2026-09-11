import { describe, expect, it } from 'vitest';
import type { Rule, RuleGroup, Scheme } from '../types';
import { topFieldsAcrossLibrary } from '../discoverFields';
import { SCHEMES } from '@/data/schemes';

function rule(partial: Partial<Rule> & Pick<Rule, 'id' | 'field' | 'operator'>): Rule {
  return { label: partial.id, sourceQuote: 'source', confidence: 1, ...partial };
}
function group(partial: Partial<RuleGroup> & Pick<RuleGroup, 'id' | 'logic' | 'rules'>): RuleGroup {
  return { label: partial.id, ...partial };
}
function scheme(overrides: Partial<Scheme> & Pick<Scheme, 'id'>): Scheme {
  return {
    name: overrides.id,
    level: 'central',
    tags: [],
    summary: {
      oneLiner: '',
      whatIsIt: '',
      benefits: [],
      whoCanApply: [],
      notFor: [],
      documents: [],
      howToApply: [],
      applyMode: 'unknown',
    },
    eligibility: [],
    exclusions: [],
    jargon: [],
    documentGaps: [],
    source: { kind: 'seed', title: overrides.id, extractedAt: '2024-01-01T00:00:00.000Z', wordCount: 0 },
    ...overrides,
  };
}

describe('topFieldsAcrossLibrary', () => {
  it('ranks fields by number of distinct schemes using them, not total rule count', () => {
    const s1 = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [rule({ id: 'r1', field: 'hasBankAccount', operator: 'is_true' })],
        }),
      ],
    });
    const s2 = scheme({
      id: 's2',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          // hasBankAccount referenced twice in the SAME scheme -- should still only count once.
          rules: [
            rule({ id: 'r1', field: 'hasBankAccount', operator: 'is_true' }),
            rule({ id: 'r2', field: 'age', operator: 'gte', value: 18 }),
          ],
        }),
      ],
      exclusions: [rule({ id: 'x1', field: 'hasBankAccount', operator: 'is_false' })],
    });
    const s3 = scheme({
      id: 's3',
      eligibility: [
        group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'age', operator: 'gte', value: 18 })] }),
      ],
    });

    const top = topFieldsAcrossLibrary([s1, s2, s3], 8);
    // hasBankAccount: 2 schemes, age: 2 schemes -- both ahead of anything unused.
    expect(top).toContain('hasBankAccount');
    expect(top).toContain('age');
    expect(top.indexOf('hasBankAccount')).toBeLessThan(top.length);
  });

  it('never includes "custom"', () => {
    const s1 = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [rule({ id: 'r1', field: 'custom', customKey: 'x', operator: 'is_true' })],
        }),
      ],
    });
    expect(topFieldsAcrossLibrary([s1], 8)).toEqual([]);
  });

  it('respects the limit', () => {
    const top = topFieldsAcrossLibrary(SCHEMES, 3);
    expect(top.length).toBeLessThanOrEqual(3);
  });

  it('produces a sensible top field for the real seed library (age is used by 5 of the 8 seeds)', () => {
    const top = topFieldsAcrossLibrary(SCHEMES, 8);
    expect(top[0]).toBe('age');
  });
});
