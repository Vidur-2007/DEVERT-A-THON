import { describe, expect, it } from 'vitest';
import type { CitizenProfile } from '@/lib/types';
import { getScheme } from '@/data/schemes';
import { evaluateScheme, nextQuestion } from '@/lib/engine';

function evalById(schemeId: string, profile: CitizenProfile) {
  const scheme = getScheme(schemeId);
  if (!scheme) throw new Error(`Seed scheme not found: ${schemeId}`);
  return evaluateScheme(scheme, profile);
}

describe('persona: Lakshmi (38, widowed agri labourer, no own land)', () => {
  const lakshmi: CitizenProfile = {
    age: 38,
    gender: 'female',
    maritalStatus: 'widowed',
    residence: 'rural',
    occupation: 'agri_labourer',
    ownsAgriLand: false,
    annualFamilyIncome: 90000,
    rationCardType: 'phh',
    hasLpgConnection: false,
    hasBankAccount: true,
    numGirlChildrenUnder10: 1,
    isIncomeTaxPayer: false,
  };

  it('PM-KISAN: NOT_ELIGIBLE (no own land)', () => {
    expect(evalById('pm-kisan', lakshmi).verdict).toBe('NOT_ELIGIBLE');
  });
  it('PMUY: ELIGIBLE', () => {
    expect(evalById('pmuy', lakshmi).verdict).toBe('ELIGIBLE');
  });
  it('SSY: ELIGIBLE', () => {
    expect(evalById('ssy', lakshmi).verdict).toBe('ELIGIBLE');
  });
  it('APY: ELIGIBLE', () => {
    expect(evalById('apy', lakshmi).verdict).toBe('ELIGIBLE');
  });
  it('PMJJBY: ELIGIBLE', () => {
    expect(evalById('pmjjby', lakshmi).verdict).toBe('ELIGIBLE');
  });
  it('PMSBY: ELIGIBLE', () => {
    expect(evalById('pmsby', lakshmi).verdict).toBe('ELIGIBLE');
  });
});

describe('persona: Ramesh (45, farmer, owns 2 acres)', () => {
  const ramesh: CitizenProfile = {
    age: 45,
    gender: 'male',
    occupation: 'farmer',
    ownsAgriLand: true,
    landHoldingAcres: 2,
    annualFamilyIncome: 180000,
    hasBankAccount: true,
    isIncomeTaxPayer: false,
    isGovtEmployeeInFamily: false,
    monthlyPension: 0,
    isProfessional: false,
    custom: { is_institutional_landholder: false },
  };

  it('PM-KISAN: ELIGIBLE', () => {
    expect(evalById('pm-kisan', ramesh).verdict).toBe('ELIGIBLE');
  });

  it('APY: NOT_ELIGIBLE with a near-miss pointing at the age limit', () => {
    const evaluation = evalById('apy', ramesh);
    expect(evaluation.verdict).toBe('NOT_ELIGIBLE');
    const ageResult = evaluation.groups[0].results.find((r) => r.rule.field === 'age');
    expect(ageResult?.status).toBe('FAIL');
    expect(ageResult?.nearMiss).toContain('age limit is 40');
  });

  it('PMJJBY: ELIGIBLE', () => {
    expect(evalById('pmjjby', ramesh).verdict).toBe('ELIGIBLE');
  });
  it('PMSBY: ELIGIBLE', () => {
    expect(evalById('pmsby', ramesh).verdict).toBe('ELIGIBLE');
  });
});

describe('persona: retired officer (62, farmer, govt employee in family, pension 25000)', () => {
  const retiredOfficer: CitizenProfile = {
    age: 62,
    occupation: 'farmer',
    ownsAgriLand: true,
    isGovtEmployeeInFamily: true,
    monthlyPension: 25000,
  };

  it('PM-KISAN: NOT_ELIGIBLE by exclusion, and the exclusion is shown as the reason', () => {
    const evaluation = evalById('pm-kisan', retiredOfficer);
    expect(evaluation.verdict).toBe('NOT_ELIGIBLE');
    const govtEmployeeExclusion = evaluation.exclusions.find((e) => e.rule.field === 'isGovtEmployeeInFamily');
    expect(govtEmployeeExclusion?.status).toBe('FAIL');
    // The eligibility group itself (owns land) still passes -- it's the exclusion that knocks them out.
    expect(evaluation.groups[0].status).toBe('PASS');
  });
});

describe("persona: Farhan (29, urban street vendor, vending certificate unknown)", () => {
  const farhan: CitizenProfile = {
    age: 29,
    residence: 'urban',
    occupation: 'street_vendor',
    annualFamilyIncome: 120000,
    hasBankAccount: true,
    isIncomeTaxPayer: false,
  };

  it('PM SVANidhi: NEED_MORE_INFO (or LIKELY_ELIGIBLE), and the next question asks about the certificate', () => {
    const scheme = getScheme('pm-svanidhi');
    if (!scheme) throw new Error('Seed scheme not found: pm-svanidhi');
    const evaluation = evaluateScheme(scheme, farhan);
    expect(['NEED_MORE_INFO', 'LIKELY_ELIGIBLE']).toContain(evaluation.verdict);

    const question = nextQuestion(scheme, farhan);
    expect(question).toEqual(
      expect.objectContaining({ kind: 'custom', customKey: 'has_vending_certificate_or_lor' }),
    );
  });

  it('APY: ELIGIBLE', () => {
    expect(evalById('apy', farhan).verdict).toBe('ELIGIBLE');
  });
});
