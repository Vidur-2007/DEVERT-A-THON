import { describe, expect, it } from 'vitest';
import type { CitizenProfile, Rule, RuleGroup, Scheme } from '../../types';
import { rankAlternatives } from '../rank';

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

describe('rankAlternatives', () => {
  const eligible = scheme({
    id: 'eligible-scheme',
    tags: ['women'],
    eligibility: [
      group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'gender', operator: 'eq', value: 'female' })] }),
    ],
  });
  const notEligible = scheme({
    id: 'not-eligible-scheme',
    eligibility: [
      group({ id: 'g1', logic: 'ALL', rules: [rule({ id: 'r1', field: 'ownsAgriLand', operator: 'is_true' })] }),
    ],
  });
  const needsInfo = scheme({
    id: 'needs-info-scheme',
    eligibility: [
      group({
        id: 'g1',
        logic: 'ALL',
        rules: [
          rule({ id: 'r1', field: 'gender', operator: 'eq', value: 'female' }),
          rule({ id: 'r2', field: 'hasBankAccount', operator: 'is_true' }),
        ],
      }),
    ],
  });
  const currentScheme = scheme({ id: 'current-scheme', tags: ['women'] });

  const profile: CitizenProfile = { gender: 'female', ownsAgriLand: false };
  const library = [currentScheme, eligible, notEligible, needsInfo];

  it('drops NOT_ELIGIBLE schemes', () => {
    const alts = rankAlternatives(profile, library, 'current-scheme');
    expect(alts.map((a) => a.scheme.id)).not.toContain('not-eligible-scheme');
  });

  it('never includes the current scheme itself', () => {
    const alts = rankAlternatives(profile, library, 'current-scheme');
    expect(alts.map((a) => a.scheme.id)).not.toContain('current-scheme');
  });

  it('ranks ELIGIBLE above NEED_MORE_INFO', () => {
    const alts = rankAlternatives(profile, library, 'current-scheme');
    const order = alts.map((a) => a.scheme.id);
    expect(order.indexOf('eligible-scheme')).toBeLessThan(order.indexOf('needs-info-scheme'));
  });

  it('respects the limit', () => {
    const alts = rankAlternatives(profile, library, 'current-scheme', 1);
    expect(alts).toHaveLength(1);
  });

  it('reports the top passing criteria as reasons', () => {
    const alts = rankAlternatives(profile, library, 'current-scheme');
    const top = alts.find((a) => a.scheme.id === 'eligible-scheme');
    expect(top?.topReasons).toContain('r1');
  });

  it('does not list the same reason twice when two rules share a label', () => {
    // Seeds sometimes author two rules with the identical plain-language label so they
    // both back one whoCanApply bullet (e.g. PMUY's gender + age rules).
    const duplicateLabelScheme = scheme({
      id: 'duplicate-label-scheme',
      eligibility: [
        group({
          id: 'g1',
          logic: 'ALL',
          rules: [
            rule({ id: 'r1', field: 'gender', operator: 'eq', value: 'female', label: 'Shared label' }),
            rule({ id: 'r2', field: 'age', operator: 'gte', value: 18, label: 'Shared label' }),
          ],
        }),
      ],
    });
    const alts = rankAlternatives({ gender: 'female', age: 25 }, [duplicateLabelScheme]);
    expect(alts[0].topReasons).toEqual(['Shared label']);
  });
});
