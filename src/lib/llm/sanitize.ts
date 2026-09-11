// Post-validation sanity pass: drop rules on unrecognised fields, clamp confidence,
// ensure unique ids, and stamp `verified` from quote verification. See SPEC.md Section 7.2 step 9.

import { FIELDS } from '../fields';
import { verifyQuote } from './verifyQuotes';
import type { ExtractedScheme } from './schema';
import type { Rule, RuleGroup, Scheme } from '../types';

const VALID_FIELD_KEYS = new Set<string>(FIELDS.map((f) => f.key));

function isValidField(field: string): boolean {
  return field === 'custom' || VALID_FIELD_KEYS.has(field);
}

function uniqueId(id: string, used: Set<string>): string {
  let candidate = id || 'r';
  while (used.has(candidate)) {
    candidate = `${candidate}-${Math.random().toString(36).slice(2, 6)}`;
  }
  used.add(candidate);
  return candidate;
}

function cleanRule(
  rule: ExtractedScheme['exclusions'][number],
  documentText: string,
  usedIds: Set<string>,
): Rule | null {
  if (!isValidField(rule.field)) return null;
  return {
    ...rule,
    field: rule.field as Rule['field'],
    id: uniqueId(rule.id, usedIds),
    confidence: Math.min(1, Math.max(0, rule.confidence)),
    verified: verifyQuote(rule.sourceQuote, documentText),
  };
}

function cleanGroup(
  group: ExtractedScheme['eligibility'][number],
  documentText: string,
  usedIds: Set<string>,
): RuleGroup | null {
  const rules = group.rules
    .map((r) => cleanRule(r, documentText, usedIds))
    .filter((r): r is Rule => r !== null);
  if (rules.length === 0) return null; // an empty ALL/ANY group evaluates in degenerate ways -- drop it
  return { ...group, rules };
}

export function sanitizeExtractedScheme(
  extracted: ExtractedScheme,
  documentText: string,
): Omit<Scheme, 'id' | 'source'> {
  const usedIds = new Set<string>();

  const eligibility = extracted.eligibility
    .map((g) => cleanGroup(g, documentText, usedIds))
    .filter((g): g is RuleGroup => g !== null);

  const exclusions = extracted.exclusions
    .map((r) => cleanRule(r, documentText, usedIds))
    .filter((r): r is Rule => r !== null);

  return {
    name: extracted.name,
    ministry: extracted.ministry,
    level: extracted.level,
    state: extracted.state,
    tags: extracted.tags,
    summary: extracted.summary,
    eligibility,
    exclusions,
    jargon: extracted.jargon,
    documentGaps: extracted.documentGaps,
  };
}
