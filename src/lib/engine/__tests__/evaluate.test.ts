import { describe, expect, it } from 'vitest';
import type { CitizenProfile, Rule, RuleGroup, Scheme } from '../../types';
import { evalGroup, evalRule, evaluateScheme } from '../evaluate';

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

describe('evalRule operators', () => {
  const profile: CitizenProfile = {
    age: 30,
    annualFamilyIncome: 200000,
    occupation: 'farmer',
    ownsAgriLand: true,
    socialCategory: 'obc',
    isIncomeTaxPayer: false,
    custom: { has_certificate: true },
  };

  it('eq', () => {
    expect(evalRule(rule({ id: 'r1', field: 'occupation', operator: 'eq', value: 'farmer' }), profile)).toBe('PASS');
    expect(evalRule(rule({ id: 'r2', field: 'occupation', operator: 'eq', value: 'student' }), profile)).toBe('FAIL');
  });

  it('neq', () => {
    expect(evalRule(rule({ id: 'r1', field: 'occupation', operator: 'neq', value: 'student' }), profile)).toBe('PASS');
    expect(evalRule(rule({ id: 'r2', field: 'occupation', operator: 'neq', value: 'farmer' }), profile)).toBe('FAIL');
  });

  it('lt / lte', () => {
    expect(evalRule(rule({ id: 'r1', field: 'age', operator: 'lt', value: 40 }), profile)).toBe('PASS');
    expect(evalRule(rule({ id: 'r2', field: 'age', operator: 'lt', value: 30 }), profile)).toBe('FAIL');
    expect(evalRule(rule({ id: 'r3', field: 'age', operator: 'lte', value: 30 }), profile)).toBe('PASS');
  });

  it('gt / gte', () => {
    expect(evalRule(rule({ id: 'r1', field: 'age', operator: 'gt', value: 18 }), profile)).toBe('PASS');
    expect(evalRule(rule({ id: 'r2', field: 'age', operator: 'gt', value: 30 }), profile)).toBe('FAIL');
    expect(evalRule(rule({ id: 'r3', field: 'age', operator: 'gte', value: 30 }), profile)).toBe('PASS');
  });

  it('between (inclusive)', () => {
    expect(evalRule(rule({ id: 'r1', field: 'age', operator: 'between', value: 18, valueMax: 40 }), profile)).toBe('PASS');
    expect(evalRule(rule({ id: 'r2', field: 'age', operator: 'between', value: 18, valueMax: 29 }), profile)).toBe('FAIL');
    expect(evalRule(rule({ id: 'r3', field: 'age', operator: 'between', value: 30, valueMax: 30 }), profile)).toBe('PASS');
  });

  it('in / not_in', () => {
    expect(evalRule(rule({ id: 'r1', field: 'socialCategory', operator: 'in', value: ['sc', 'st', 'obc'] }), profile)).toBe('PASS');
    expect(evalRule(rule({ id: 'r2', field: 'socialCategory', operator: 'in', value: ['sc', 'st'] }), profile)).toBe('FAIL');
    expect(evalRule(rule({ id: 'r3', field: 'socialCategory', operator: 'not_in', value: ['sc', 'st'] }), profile)).toBe('PASS');
  });

  it('is_true / is_false', () => {
    expect(evalRule(rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' }), profile)).toBe('PASS');
    expect(evalRule(rule({ id: 'r2', field: 'isIncomeTaxPayer', operator: 'is_true' }), profile)).toBe('FAIL');
    expect(evalRule(rule({ id: 'r3', field: 'isIncomeTaxPayer', operator: 'is_false' }), profile)).toBe('PASS');
  });

  it('custom field via profile.custom', () => {
    expect(
      evalRule(rule({ id: 'r1', field: 'custom', customKey: 'has_certificate', operator: 'is_true' }), profile),
    ).toBe('PASS');
    expect(
      evalRule(rule({ id: 'r2', field: 'custom', customKey: 'unset_key', operator: 'is_true' }), profile),
    ).toBe('UNKNOWN');
  });

  it('missing value in profile -> UNKNOWN regardless of operator', () => {
    expect(evalRule(rule({ id: 'r1', field: 'state', operator: 'eq', value: 'Bihar' }), {})).toBe('UNKNOWN');
    expect(evalRule(rule({ id: 'r2', field: 'hasBankAccount', operator: 'is_true' }), {})).toBe('UNKNOWN');
  });
});

describe('evalGroup logic', () => {
  it('ALL: any FAIL -> FAIL, even with unknowns present', () => {
    const g = group({
      id: 'g1',
      logic: 'ALL',
      rules: [
        rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' }),
        rule({ id: 'r2', field: 'isIncomeTaxPayer', operator: 'is_false' }),
        rule({ id: 'r3', field: 'hasBankAccount', operator: 'is_true' }), // unknown
      ],
    });
    const { status } = evalGroup(g, { ownsAgriLand: false, isIncomeTaxPayer: false });
    expect(status).toBe('FAIL');
  });

  it('ALL: all PASS -> PASS', () => {
    const g = group({
      id: 'g1',
      logic: 'ALL',
      rules: [
        rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' }),
        rule({ id: 'r2', field: 'age', operator: 'gte', value: 18 }),
      ],
    });
    const { status } = evalGroup(g, { ownsAgriLand: true, age: 25 });
    expect(status).toBe('PASS');
  });

  it('ALL: no FAIL but an unknown -> UNKNOWN', () => {
    const g = group({
      id: 'g1',
      logic: 'ALL',
      rules: [
        rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' }),
        rule({ id: 'r2', field: 'age', operator: 'gte', value: 18 }),
      ],
    });
    const { status } = evalGroup(g, { ownsAgriLand: true });
    expect(status).toBe('UNKNOWN');
  });

  it('ANY: any PASS -> PASS', () => {
    const g = group({
      id: 'g1',
      logic: 'ANY',
      rules: [
        rule({ id: 'r1', field: 'rationCardType', operator: 'in', value: ['aay', 'phh'] }),
        rule({ id: 'r2', field: 'socialCategory', operator: 'in', value: ['sc', 'st'] }),
      ],
    });
    const { status } = evalGroup(g, { rationCardType: 'apl', socialCategory: 'sc' });
    expect(status).toBe('PASS');
  });

  it('ANY: all FAIL -> FAIL', () => {
    const g = group({
      id: 'g1',
      logic: 'ANY',
      rules: [
        rule({ id: 'r1', field: 'rationCardType', operator: 'in', value: ['aay', 'phh'] }),
        rule({ id: 'r2', field: 'socialCategory', operator: 'in', value: ['sc', 'st'] }),
      ],
    });
    const { status } = evalGroup(g, { rationCardType: 'apl', socialCategory: 'general' });
    expect(status).toBe('FAIL');
  });

  it('ANY: no PASS but an unknown -> UNKNOWN', () => {
    const g = group({
      id: 'g1',
      logic: 'ANY',
      rules: [
        rule({ id: 'r1', field: 'rationCardType', operator: 'in', value: ['aay', 'phh'] }),
        rule({ id: 'r2', field: 'socialCategory', operator: 'in', value: ['sc', 'st'] }),
      ],
    });
    const { status } = evalGroup(g, { rationCardType: 'apl' });
    expect(status).toBe('UNKNOWN');
  });
});

describe('evaluateScheme verdicts', () => {
  it('exclusion hit -> NOT_ELIGIBLE, and the exclusion result explains why', () => {
    const s = scheme({
      id: 'pm-kisan',
      eligibility: [
        group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' })] }),
      ],
      exclusions: [
        rule({ id: 'x1', field: 'isGovtEmployeeInFamily', operator: 'is_true', label: 'Government employee in family' }),
      ],
    });
    const evaluation = evaluateScheme(s, { ownsAgriLand: true, isGovtEmployeeInFamily: true });
    expect(evaluation.verdict).toBe('NOT_ELIGIBLE');
    expect(evaluation.exclusions[0].status).toBe('FAIL');
    expect(evaluation.exclusions[0].rule.label).toBe('Government employee in family');
  });

  it('all known and passing -> ELIGIBLE', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' })] }),
      ],
      exclusions: [rule({ id: 'x1', field: 'isIncomeTaxPayer', operator: 'is_true' })],
    });
    const evaluation = evaluateScheme(s, { ownsAgriLand: true, isIncomeTaxPayer: false });
    expect(evaluation.verdict).toBe('ELIGIBLE');
    expect(evaluation.knownRatio).toBe(1);
    expect(evaluation.matchScore).toBe(1);
  });

  it('knownRatio >= 0.75 with no FAIL -> LIKELY_ELIGIBLE', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [
            rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' }),
            rule({ id: 'r2', field: 'age', operator: 'gte', value: 18 }),
            rule({ id: 'r3', field: 'hasBankAccount', operator: 'is_true' }),
          ],
        }),
      ],
      exclusions: [rule({ id: 'x1', field: 'isIncomeTaxPayer', operator: 'is_true' })],
    });
    // 3 of 4 rules known (75%), none FAIL -> LIKELY_ELIGIBLE
    const evaluation = evaluateScheme(s, { ownsAgriLand: true, age: 25, isIncomeTaxPayer: false });
    expect(evaluation.knownRatio).toBe(0.75);
    expect(evaluation.verdict).toBe('LIKELY_ELIGIBLE');
  });

  it('knownRatio < 0.75 with no FAIL -> NEED_MORE_INFO', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [
            rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' }),
            rule({ id: 'r2', field: 'age', operator: 'gte', value: 18 }),
            rule({ id: 'r3', field: 'hasBankAccount', operator: 'is_true' }),
            rule({ id: 'r4', field: 'hasAadhaar', operator: 'is_true' }),
          ],
        }),
      ],
    });
    // 2 of 4 rules known (50%), none FAIL -> NEED_MORE_INFO
    const evaluation = evaluateScheme(s, { ownsAgriLand: true, age: 25 });
    expect(evaluation.knownRatio).toBe(0.5);
    expect(evaluation.verdict).toBe('NEED_MORE_INFO');
    expect(evaluation.missingFields).toEqual(expect.arrayContaining(['hasBankAccount', 'hasAadhaar']));
  });

  it('missingFields is ordered by importance (knock-out ALL rules first)', () => {
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
    const evaluation = evaluateScheme(s, {});
    // ownsAgriLand (ALL, weight 3) should outrank socialCategory (ANY, weight 1)
    expect(evaluation.missingFields[0]).toBe('ownsAgriLand');
  });

  it('missingCustom collects unanswered custom yes/no questions', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [rule({ id: 'r1', field: 'custom', customKey: 'has_vending_certificate', operator: 'is_true' })],
        }),
      ],
    });
    const evaluation = evaluateScheme(s, {});
    expect(evaluation.missingCustom).toEqual(['has_vending_certificate']);
  });
});

describe('near-miss hints surface on FAILed rules inside groups', () => {
  it('income lte fail', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [rule({ id: 'r1', field: 'annualFamilyIncome', operator: 'lte', value: 250000 })],
        }),
      ],
    });
    const evaluation = evaluateScheme(s, { annualFamilyIncome: 270000 });
    expect(evaluation.groups[0].results[0].nearMiss).toBe(
      'Your family income is ₹20,000 above the limit of ₹2,50,000.',
    );
  });

  it('age gte fail (too young)', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'age', operator: 'gte', value: 18 })] }),
      ],
    });
    const evaluation = evaluateScheme(s, { age: 16 });
    expect(evaluation.groups[0].results[0].nearMiss).toBe('You will become eligible in 2 years.');
  });

  it('age lte fail (too old)', () => {
    const s = scheme({
      id: 's1',
      eligibility: [
        group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'age', operator: 'lte', value: 40 })] }),
      ],
    });
    const evaluation = evaluateScheme(s, { age: 45 });
    expect(evaluation.groups[0].results[0].nearMiss).toBe('The age limit is 40; you crossed it 5 years ago.');
  });
});
