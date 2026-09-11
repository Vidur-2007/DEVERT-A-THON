// zod schemas that validate every LLM response before the app trusts it.
// See SPEC.md Section 7.2 step 7 and CLAUDE.md: "Every LLM response is zod-validated."

import { z } from 'zod';
import { FIELDS } from '../fields';
import type { FieldKey } from '../types';

const FIELD_KEY_TUPLE = FIELDS.map((f) => f.key) as [FieldKey, ...FieldKey[]];

// Loose on purpose: an LLM-hallucinated field name should drop that one rule
// (see sanitize.ts step 9), not fail the whole extraction. The strict allow-list
// is used for /api/profile-parse below, where wrong keys are simply dropped by zod.
const ruleFieldSchema = z.string().min(1);

const operatorSchema = z.enum([
  'eq',
  'neq',
  'lt',
  'lte',
  'gt',
  'gte',
  'between',
  'in',
  'not_in',
  'is_true',
  'is_false',
]);

const ruleValueSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
  z.array(z.union([z.string(), z.number()])),
]);

export const ExtractedRuleSchema = z.object({
  id: z.string().min(1),
  field: ruleFieldSchema,
  operator: operatorSchema,
  value: ruleValueSchema.optional(),
  valueMax: z.number().optional(),
  customKey: z.string().optional(),
  customQuestion: z.string().optional(),
  label: z.string().min(1),
  sourceQuote: z.string().min(1).max(400),
  confidence: z.number(),
});

export const ExtractedRuleGroupSchema = z.object({
  id: z.string().min(1),
  logic: z.enum(['ALL', 'ANY']),
  label: z.string().min(1),
  rules: z.array(ExtractedRuleSchema).min(1),
});

const BenefitSchema = z.object({
  text: z.string().min(1),
  amount: z.string().optional(),
});

const DocumentSchema = z.object({
  name: z.string().min(1),
  why: z.string().optional(),
  mandatory: z.boolean(),
});

const ApplyStepSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(1),
});

const SummarySchema = z.object({
  oneLiner: z.string().min(1),
  whatIsIt: z.string().min(1),
  benefits: z.array(BenefitSchema),
  whoCanApply: z.array(z.string()),
  notFor: z.array(z.string()),
  documents: z.array(DocumentSchema),
  howToApply: z.array(ApplyStepSchema),
  applyMode: z.enum(['online', 'offline', 'both', 'unknown']),
  officialUrl: z.string().optional(),
  helpline: z.string().optional(),
  deadline: z.string().optional(),
});

const JargonSchema = z.object({
  term: z.string().min(1),
  meaning: z.string().min(1),
});

// The extraction output shape: Scheme minus id/source/translations (SPEC 7.3 note).
export const ExtractedSchemeSchema = z.object({
  name: z.string().min(1),
  ministry: z.string().optional(),
  level: z.enum(['central', 'state']),
  state: z.string().optional(),
  tags: z.array(z.string()),
  summary: SummarySchema,
  eligibility: z.array(ExtractedRuleGroupSchema),
  exclusions: z.array(ExtractedRuleSchema),
  jargon: z.array(JargonSchema).max(8),
  documentGaps: z.array(z.string()),
});
export type ExtractedScheme = z.infer<typeof ExtractedSchemeSchema>;

export const ExtractionResultSchema = z.union([
  ExtractedSchemeSchema,
  z.object({ error: z.literal('NOT_A_SCHEME') }),
]);
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

// /api/explain
export const ExplainResultSchema = z.object({
  explanation: z.string().min(1).max(1200),
});
export type ExplainResult = z.infer<typeof ExplainResultSchema>;

// /api/profile-parse -- every CitizenProfile field, all optional; unknown keys are
// silently dropped by zod (no .strict()), which is what we want for LLM output.
export const ParsedProfileSchema = z.object({
  age: z.number().min(0).max(130).optional(),
  gender: z.enum(['male', 'female', 'transgender']).optional(),
  state: z.string().optional(),
  residence: z.enum(['rural', 'urban']).optional(),
  annualFamilyIncome: z.number().min(0).optional(),
  socialCategory: z.enum(['general', 'obc', 'sc', 'st', 'ews']).optional(),
  occupation: z
    .enum([
      'farmer',
      'agri_labourer',
      'street_vendor',
      'artisan',
      'student',
      'salaried_private',
      'govt_employee',
      'self_employed',
      'unemployed',
      'homemaker',
      'retired',
    ])
    .optional(),
  ownsAgriLand: z.boolean().optional(),
  landHoldingAcres: z.number().min(0).optional(),
  rationCardType: z.enum(['aay', 'phh', 'bpl', 'apl', 'none']).optional(),
  isIncomeTaxPayer: z.boolean().optional(),
  isGovtEmployeeInFamily: z.boolean().optional(),
  monthlyPension: z.number().min(0).optional(),
  isProfessional: z.boolean().optional(),
  hasPuccaHouse: z.boolean().optional(),
  hasLpgConnection: z.boolean().optional(),
  hasBankAccount: z.boolean().optional(),
  hasAadhaar: z.boolean().optional(),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced']).optional(),
  familySize: z.number().min(0).optional(),
  numGirlChildrenUnder10: z.number().min(0).optional(),
  disabilityPercent: z.number().min(0).max(100).optional(),
  isPregnantOrLactating: z.boolean().optional(),
  educationLevel: z
    .enum(['none', 'primary', 'secondary', 'higher_secondary', 'graduate', 'postgraduate'])
    .optional(),
});

export const ProfileParseResultSchema = z.object({
  profile: ParsedProfileSchema,
  unclear: z.array(z.string()),
});
export type ProfileParseResult = z.infer<typeof ProfileParseResultSchema>;

// Re-exported so callers don't need to reach into fields.ts just for this.
export { FIELD_KEY_TUPLE };
