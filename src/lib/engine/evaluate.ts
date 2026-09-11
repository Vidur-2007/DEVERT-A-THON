// Deterministic evaluation of a Scheme against a CitizenProfile.
// Pure TypeScript: no React, no fetch, no LLM. See SPEC.md Section 6.4.

import type {
  CitizenProfile,
  Evaluation,
  FieldKey,
  Rule,
  RuleGroup,
  RuleResult,
  Scheme,
  Status,
  Verdict,
} from '../types';
import { nearMiss } from './nearMiss';

/** Reads the value a rule cares about off the profile (handles `custom`). */
export function getFieldValue(rule: Rule, profile: CitizenProfile): unknown {
  if (rule.field === 'custom') {
    if (!rule.customKey) return undefined;
    return profile.custom?.[rule.customKey];
  }
  return profile[rule.field];
}

/** Evaluate a single rule's condition. Missing value => UNKNOWN (Kleene logic). */
export function evalRule(rule: Rule, profile: CitizenProfile): Status {
  const raw = getFieldValue(rule, profile);
  if (raw === undefined || raw === null) return 'UNKNOWN';

  switch (rule.operator) {
    case 'is_true':
      return raw === true ? 'PASS' : 'FAIL';
    case 'is_false':
      return raw === false ? 'PASS' : 'FAIL';
    case 'eq':
      return raw === rule.value ? 'PASS' : 'FAIL';
    case 'neq':
      return raw !== rule.value ? 'PASS' : 'FAIL';
    case 'lt':
      return typeof raw === 'number' && typeof rule.value === 'number' && raw < rule.value
        ? 'PASS'
        : 'FAIL';
    case 'lte':
      return typeof raw === 'number' && typeof rule.value === 'number' && raw <= rule.value
        ? 'PASS'
        : 'FAIL';
    case 'gt':
      return typeof raw === 'number' && typeof rule.value === 'number' && raw > rule.value
        ? 'PASS'
        : 'FAIL';
    case 'gte':
      return typeof raw === 'number' && typeof rule.value === 'number' && raw >= rule.value
        ? 'PASS'
        : 'FAIL';
    case 'between': {
      if (typeof raw !== 'number' || typeof rule.value !== 'number' || typeof rule.valueMax !== 'number') {
        return 'FAIL';
      }
      return raw >= rule.value && raw <= rule.valueMax ? 'PASS' : 'FAIL';
    }
    case 'in': {
      const list = Array.isArray(rule.value) ? rule.value : [];
      return list.includes(raw as string | number) ? 'PASS' : 'FAIL';
    }
    case 'not_in': {
      const list = Array.isArray(rule.value) ? rule.value : [];
      return !list.includes(raw as string | number) ? 'PASS' : 'FAIL';
    }
    default:
      return 'UNKNOWN';
  }
}

/** ALL: any FAIL -> FAIL; all PASS -> PASS; else UNKNOWN. ANY: any PASS -> PASS; all FAIL -> FAIL; else UNKNOWN. */
export function evalGroup(
  group: RuleGroup,
  profile: CitizenProfile,
): { status: Status; results: RuleResult[] } {
  const results: RuleResult[] = group.rules.map((rule) => {
    const status = evalRule(rule, profile);
    const result: RuleResult = { rule, status, kind: 'eligibility' };
    if (status === 'FAIL') {
      const hint = nearMiss(rule, profile);
      if (hint) result.nearMiss = hint;
    }
    return result;
  });

  let status: Status;
  if (group.logic === 'ALL') {
    if (results.some((r) => r.status === 'FAIL')) status = 'FAIL';
    else if (results.every((r) => r.status === 'PASS')) status = 'PASS';
    else status = 'UNKNOWN';
  } else {
    if (results.some((r) => r.status === 'PASS')) status = 'PASS';
    else if (results.every((r) => r.status === 'FAIL')) status = 'FAIL';
    else status = 'UNKNOWN';
  }
  return { status, results };
}

/** Exclusion rule describes the EXCLUDED person: condition true => EXCLUDED (FAIL). */
export function evalExclusion(rule: Rule, profile: CitizenProfile): RuleResult {
  const conditionStatus = evalRule(rule, profile);
  let status: Status;
  if (conditionStatus === 'PASS') status = 'FAIL'; // condition true -> excluded
  else if (conditionStatus === 'FAIL') status = 'PASS'; // condition false -> not excluded
  else status = 'UNKNOWN';
  return { rule, status, kind: 'exclusion' };
}

/** Total weight a field carries within one scheme (knock-out rules score higher). */
export function fieldWeightInScheme(field: FieldKey, scheme: Scheme): number {
  let weight = 0;
  for (const group of scheme.eligibility) {
    for (const rule of group.rules) {
      if (rule.field === field) weight += group.logic === 'ALL' ? 3 : 1;
    }
  }
  for (const rule of scheme.exclusions) {
    if (rule.field === field) weight += 3; // exclusions are always knock-outs
  }
  return weight;
}

/** Same as fieldWeightInScheme but for a scheme-specific custom yes/no question. */
export function customWeightInScheme(customKey: string, scheme: Scheme): number {
  let weight = 0;
  for (const group of scheme.eligibility) {
    for (const rule of group.rules) {
      if (rule.field === 'custom' && rule.customKey === customKey) {
        weight += group.logic === 'ALL' ? 3 : 1;
      }
    }
  }
  for (const rule of scheme.exclusions) {
    if (rule.field === 'custom' && rule.customKey === customKey) weight += 3;
  }
  return weight;
}

function orderFieldsByImportance(fields: FieldKey[], scheme: Scheme): FieldKey[] {
  return [...fields].sort((a, b) => fieldWeightInScheme(b, scheme) - fieldWeightInScheme(a, scheme));
}

/**
 * verdict:
 *   any group FAIL or any exclusion hit          -> NOT_ELIGIBLE
 *   all groups PASS and all exclusions PASS      -> ELIGIBLE
 *   no FAIL and knownRatio >= 0.75                -> LIKELY_ELIGIBLE
 *   otherwise                                    -> NEED_MORE_INFO
 */
export function evaluateScheme(scheme: Scheme, profile: CitizenProfile): Evaluation {
  const groups = scheme.eligibility.map((group) => {
    const { status, results } = evalGroup(group, profile);
    return { group, status, results };
  });

  const exclusions = scheme.exclusions.map((rule) => evalExclusion(rule, profile));

  const anyGroupFail = groups.some((g) => g.status === 'FAIL');
  const anyExclusionHit = exclusions.some((e) => e.status === 'FAIL');
  const allGroupsPass = groups.every((g) => g.status === 'PASS');
  const allExclusionsPass = exclusions.every((e) => e.status === 'PASS');

  const allResults: RuleResult[] = [...groups.flatMap((g) => g.results), ...exclusions];
  const totalRules = allResults.length;
  const knownCount = allResults.filter((r) => r.status !== 'UNKNOWN').length;
  const knownRatio = totalRules === 0 ? 1 : knownCount / totalRules;
  const passCount = allResults.filter((r) => r.status === 'PASS').length;
  const matchScore = totalRules === 0 ? 0 : passCount / totalRules;

  let verdict: Verdict;
  if (anyGroupFail || anyExclusionHit) {
    verdict = 'NOT_ELIGIBLE';
  } else if (allGroupsPass && allExclusionsPass) {
    verdict = 'ELIGIBLE';
  } else if (knownRatio >= 0.75) {
    verdict = 'LIKELY_ELIGIBLE';
  } else {
    verdict = 'NEED_MORE_INFO';
  }

  const missingFieldsSet = new Set<FieldKey>();
  const missingCustomSet = new Set<string>();
  for (const r of allResults) {
    if (r.status !== 'UNKNOWN') continue;
    if (r.rule.field === 'custom') {
      if (r.rule.customKey) missingCustomSet.add(r.rule.customKey);
    } else {
      missingFieldsSet.add(r.rule.field);
    }
  }

  return {
    schemeId: scheme.id,
    verdict,
    knownRatio,
    matchScore,
    groups,
    exclusions,
    missingFields: orderFieldsByImportance([...missingFieldsSet], scheme),
    missingCustom: [...missingCustomSet],
  };
}
