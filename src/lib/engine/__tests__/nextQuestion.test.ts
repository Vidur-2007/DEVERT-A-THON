import { describe, expect, it } from 'vitest';
import type { Rule, RuleGroup, Scheme } from '../../types';
import { nextQuestion } from '../nextQuestion';

function rule(partial: Partial<Rule> & Pick<Rule, 'id' | 'field' | 'operator'>): Rule {
  return {
    label: partial.id,
    sourceQuote: 'source quote',
    confidence: 1,
    ...partial,
  };
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

describe('nextQuestion', () => {
  it('prefers a knock-out (ALL group) field over an ANY-group field', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' })] }),
        group({
          id: 'g2',
          logic: 'ANY',
          rules: [rule({ id: 'r2', field: 'socialCategory', operator: 'in', value: ['sc', 'st'] })],
        }),
      ],
    });
    const q = nextQuestion(s, {});
    expect(q).not.toBeNull();
    expect(q?.kind).toBe('field');
    if (q?.kind === 'field') expect(q.field).toBe('ownsAgriLand');
  });

  it('prefers an exclusion field (always a knock-out) over an ANY-group field', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ANY',
          rules: [rule({ id: 'r1', field: 'socialCategory', operator: 'in', value: ['sc', 'st'] })],
        }),
      ],
      exclusions: [rule({ id: 'x1', field: 'isIncomeTaxPayer', operator: 'is_true' })],
    });
    const q = nextQuestion(s, {});
    expect(q).toEqual(expect.objectContaining({ kind: 'field', field: 'isIncomeTaxPayer' }));
  });

  it('ties break toward the cheaper question type (boolean before number)', () => {
    // Both fields appear once in an ALL group -> equal weight (3). ownsAgriLand is boolean,
    // landHoldingAcres is a number, so the boolean question should win the tie.
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [
            rule({ id: 'r1', field: 'landHoldingAcres', operator: 'gte', value: 1 }),
            rule({ id: 'r2', field: 'ownsAgriLand', operator: 'is_true' }),
          ],
        }),
      ],
    });
    const q = nextQuestion(s, {});
    expect(q).toEqual(expect.objectContaining({ kind: 'field', field: 'ownsAgriLand' }));
  });

  it('a field used by more schemes in the library scores higher (library bonus)', () => {
    const shared = scheme({
      id: 'shared',
      eligibility: [
        group({ id: 'g1', logic: 'ANY', rules: [rule({ id: 'r1', field: 'hasBankAccount', operator: 'is_true' })] }),
      ],
    });
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ANY',
          rules: [
            rule({ id: 'r1', field: 'hasBankAccount', operator: 'is_true' }),
            rule({ id: 'r2', field: 'hasAadhaar', operator: 'is_true' }),
          ],
        }),
      ],
    });
    // Both fields have equal in-scheme weight and type cost (both boolean), but hasBankAccount
    // also appears in `shared`, so it should be picked first when the library is passed in.
    const q = nextQuestion(s, {}, [s, shared]);
    expect(q).toEqual(expect.objectContaining({ kind: 'field', field: 'hasBankAccount' }));
  });

  it('asks a custom yes/no question when that is the only unknown', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [
            rule({
              id: 'r1',
              field: 'custom',
              customKey: 'has_vending_certificate',
              operator: 'is_true',
              customQuestion: { en: 'Do you have a vending certificate?', hi: '', te: '', ta: '' },
            }),
          ],
        }),
      ],
    });
    const q = nextQuestion(s, {});
    expect(q).toEqual(
      expect.objectContaining({
        kind: 'custom',
        customKey: 'has_vending_certificate',
        question: 'Do you have a vending certificate?',
      }),
    );
  });

  it('returns null once the verdict is ELIGIBLE', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' })] }),
      ],
    });
    expect(nextQuestion(s, { ownsAgriLand: true })).toBeNull();
  });

  it('returns null once the verdict is NOT_ELIGIBLE (knock-out already hit)', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [
            rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' }),
            rule({ id: 'r2', field: 'age', operator: 'gte', value: 18 }), // still unknown
          ],
        }),
      ],
    });
    expect(nextQuestion(s, { ownsAgriLand: false })).toBeNull();
  });

  it('returns null when there is nothing left to ask', () => {
    const s = scheme({ id: 's1', eligibility: [] });
    expect(nextQuestion(s, {})).toBeNull();
  });
});
