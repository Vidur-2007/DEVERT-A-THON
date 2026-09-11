// Canonical types for Yojana Saathi. See SPEC.md Section 6.

export type Lang = 'en' | 'hi' | 'te' | 'ta';

export interface CitizenProfile {
  age?: number;
  gender?: 'male' | 'female' | 'transgender';
  state?: string; // Indian state/UT name
  residence?: 'rural' | 'urban';
  annualFamilyIncome?: number; // INR per year
  socialCategory?: 'general' | 'obc' | 'sc' | 'st' | 'ews';
  occupation?:
    | 'farmer'
    | 'agri_labourer'
    | 'street_vendor'
    | 'artisan'
    | 'student'
    | 'salaried_private'
    | 'govt_employee'
    | 'self_employed'
    | 'unemployed'
    | 'homemaker'
    | 'retired';
  ownsAgriLand?: boolean;
  landHoldingAcres?: number;
  rationCardType?: 'aay' | 'phh' | 'bpl' | 'apl' | 'none';
  isIncomeTaxPayer?: boolean;
  isGovtEmployeeInFamily?: boolean; // serving/retired govt employee or constitutional post holder
  monthlyPension?: number; // INR
  isProfessional?: boolean; // doctor, engineer, lawyer, CA, architect (registered, practising)
  hasPuccaHouse?: boolean;
  hasLpgConnection?: boolean; // anyone in household
  hasBankAccount?: boolean;
  hasAadhaar?: boolean;
  maritalStatus?: 'single' | 'married' | 'widowed' | 'divorced';
  familySize?: number;
  numGirlChildrenUnder10?: number;
  disabilityPercent?: number;
  isPregnantOrLactating?: boolean;
  educationLevel?: 'none' | 'primary' | 'secondary' | 'higher_secondary' | 'graduate' | 'postgraduate';
  custom?: Record<string, boolean>; // answers to scheme-specific yes/no questions
}

export type FieldKey = Exclude<keyof CitizenProfile, 'custom'>;

export type Operator =
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_true'
  | 'is_false';

export interface Rule {
  id: string; // "r1", "x2"
  field: FieldKey | 'custom';
  operator: Operator;
  value?: number | string | boolean | (string | number)[];
  valueMax?: number; // for 'between' (inclusive)
  customKey?: string; // when field === 'custom', e.g. "is_landholder_family"
  customQuestion?: Record<Lang, string> | string; // yes/no question for custom rules
  label: string; // plain-language criterion: "Age between 18 and 40"
  sourceQuote: string; // verbatim sentence from the document
  verified?: boolean; // set by server quote verification
  confidence: number; // 0-1, LLM self-reported
}

export interface RuleGroup {
  id: string;
  logic: 'ALL' | 'ANY'; // ALL = every rule must pass; ANY = at least one
  label: string; // "Basic eligibility", "Belongs to one of these groups"
  rules: Rule[];
}

export interface Scheme {
  id: string;
  name: string;
  ministry?: string;
  level: 'central' | 'state';
  state?: string;
  tags: string[]; // "farmers", "women", "pension", "health", "housing", "education", "insurance", "loan"
  summary: {
    oneLiner: string; // <= 20 words
    whatIsIt: string; // <= 60 words, Grade-6 reading level
    benefits: { text: string; amount?: string }[];
    whoCanApply: string[]; // derived from rules, plain words
    notFor: string[]; // derived from exclusions
    documents: { name: string; why?: string; mandatory: boolean }[];
    howToApply: { title: string; detail: string }[];
    applyMode: 'online' | 'offline' | 'both' | 'unknown';
    officialUrl?: string;
    helpline?: string;
    deadline?: string;
  };
  eligibility: RuleGroup[]; // ALL groups must pass
  exclusions: Rule[]; // rule describes the EXCLUDED person; true => not eligible
  jargon: { term: string; meaning: string }[];
  documentGaps: string[]; // things the document does not specify / is ambiguous about
  source: { kind: 'seed' | 'upload'; title: string; url?: string; extractedAt: string; wordCount: number };
  translations?: Partial<Record<Lang, Scheme['summary'] & { ruleLabels: Record<string, string> }>>;
}

// Evaluation

export type Status = 'PASS' | 'FAIL' | 'UNKNOWN';
export type Verdict = 'ELIGIBLE' | 'LIKELY_ELIGIBLE' | 'NEED_MORE_INFO' | 'NOT_ELIGIBLE';

export interface RuleResult {
  rule: Rule;
  status: Status;
  kind: 'eligibility' | 'exclusion';
  nearMiss?: string;
}

export interface Evaluation {
  schemeId: string;
  verdict: Verdict;
  knownRatio: number;
  matchScore: number;
  groups: { group: RuleGroup; status: Status; results: RuleResult[] }[];
  exclusions: RuleResult[];
  missingFields: FieldKey[]; // unknown fields, ordered by importance
  missingCustom: string[]; // unanswered custom yes/no questions
}
