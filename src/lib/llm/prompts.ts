// Prompts, used verbatim per SPEC.md Section 7.3. Placeholders are filled by the
// small builder functions below rather than string-replaced at call sites.

import { FIELDS } from '../fields';
import type { Lang } from '../types';

export const LANGUAGE_NAMES: Record<Lang, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
};

function fieldListWithTypesAndEnumValues(): string {
  return FIELDS.map((f) => {
    if (f.type === 'enum' && f.options) {
      return `- ${f.key}: enum [${f.options.map((o) => o.value).join(', ')}]`;
    }
    if (f.type === 'boolean') return `- ${f.key}: boolean`;
    return `- ${f.key}: number${f.unit ? ` (${f.unit})` : ''}`;
  }).join('\n');
}

export const EXTRACTION_SYSTEM = `You are a legal-to-plain-language compiler for Indian government welfare schemes.
You convert a scheme document into a strict JSON object that a computer program will use
to decide eligibility. Accuracy matters more than completeness. Never invent facts.

RULES
1. Output ONLY a JSON object matching the schema. No markdown, no commentary.
2. Every eligibility rule and exclusion MUST include "sourceQuote": an exact, verbatim sentence
   or phrase copied from the document (max 40 words). If you cannot quote it, do not create the rule.
3. Map each condition to one of these profile fields where possible:
   ${fieldListWithTypesAndEnumValues()}
   Use field "custom" with a short snake_case "customKey" and a simple yes/no "customQuestion"
   only when no field fits (e.g. "Is your family listed in SECC 2011 data?").
4. Money is in INR per year unless the document says otherwise; convert "per month" to per year
   only for annualFamilyIncome. Convert "lakh" (1,00,000) and "crore" (1,00,00,000) to numbers.
5. Exclusions describe who is NOT allowed (e.g. income tax payers). Write the condition so that
   it is TRUE for the excluded person (field isIncomeTaxPayer, operator is_true).
6. Use RuleGroup logic "ANY" when the document says "any one of the following" / "or".
7. Plain-language fields ("label", summary text, whoCanApply, notFor, howToApply) must be
   simple: short sentences, everyday words, Grade-6 reading level, no legal terms.
8. "documentGaps": list important things the document does NOT clearly state
   (e.g. "No income limit is mentioned", "Application deadline not given").
9. "jargon": up to 8 difficult terms from the document with one-line plain meanings.
10. If the text is not a government scheme, return {"error":"NOT_A_SCHEME"}.`;

// One worked example rule for an age range, one for an exclusion, per SPEC 7.3.
const SCHEME_JSON_SHAPE_WITH_EXAMPLE_VALUES = `{
  "name": "Example Scheme Name",
  "ministry": "Ministry example (optional)",
  "level": "central",
  "tags": ["farmers"],
  "summary": {
    "oneLiner": "One short sentence, <=20 words.",
    "whatIsIt": "Plain-language paragraph, <=60 words, Grade-6 level.",
    "benefits": [{ "text": "What the citizen receives", "amount": "₹6,000/year" }],
    "whoCanApply": ["Plain-language eligibility bullet, matching a rule's label"],
    "notFor": ["Plain-language exclusion bullet, matching an exclusion's label"],
    "documents": [{ "name": "Aadhaar card", "why": "Optional reason", "mandatory": true }],
    "howToApply": [{ "title": "Step title", "detail": "Step detail" }],
    "applyMode": "online",
    "officialUrl": "https://example.gov.in",
    "helpline": "1800-000-000"
  },
  "eligibility": [
    {
      "id": "g1",
      "logic": "ALL",
      "label": "Basic eligibility",
      "rules": [
        {
          "id": "r1",
          "field": "age",
          "operator": "between",
          "value": 18,
          "valueMax": 40,
          "label": "Your age is between 18 and 40",
          "sourceQuote": "Any citizen between 18 and 40 years of age is eligible.",
          "confidence": 0.9
        }
      ]
    }
  ],
  "exclusions": [
    {
      "id": "x1",
      "field": "isIncomeTaxPayer",
      "operator": "is_true",
      "label": "Income tax payers",
      "sourceQuote": "Any person who paid income tax in the last assessment year.",
      "confidence": 0.85
    }
  ],
  "jargon": [{ "term": "e-KYC", "meaning": "An online identity check using your Aadhaar number." }],
  "documentGaps": ["No income limit is mentioned."]
}`;

export function buildExtractionUserPrompt(params: { title: string; text: string }): string {
  return `Return JSON with this exact shape:
${SCHEME_JSON_SHAPE_WITH_EXAMPLE_VALUES}

DOCUMENT TITLE (if known): ${params.title || 'Unknown'}
DOCUMENT TEXT:
<<<
${params.text}
>>>`;
}

export function buildExplainSystem(lang: Lang): string {
  const languageName = LANGUAGE_NAMES[lang];
  return `You explain a government scheme eligibility result to a citizen with limited reading skills.
Use ONLY the facts in the provided JSON. Do not add rules, amounts, or advice not present.
Write in ${languageName}. Use short sentences and a warm, respectful tone. Address the person as "you".
Maximum 110 words. Structure: 1) the result in one sentence, 2) the main reason(s),
3) what to do next (missing info, documents, or other schemes). Never promise approval;
say "based on what you told us". Return JSON: {"explanation": "..."}.`;
}

export interface ExplainPayload {
  schemeName: string;
  verdict: string;
  passed: string[];
  failed: { label: string; nearMiss?: string }[];
  unknown: string[];
  documentGaps: string[];
  topAlternatives: string[];
}

export function buildExplainUserPrompt(payload: ExplainPayload): string {
  // No profile values here -- only rule labels and the verdict -- so nothing that
  // could identify anyone ever reaches the model (CLAUDE.md: never send PII).
  return JSON.stringify(payload);
}

export function buildProfileParseSystem(): string {
  return `Extract facts about a person from their description into JSON using ONLY these keys:
${fieldListWithTypesAndEnumValues()}
Include a key only if it is clearly stated or directly implied (e.g. "I farm my own 2 acres" →
occupation "farmer", ownsAgriLand true, landHoldingAcres 2). Convert lakh/thousand to numbers.
The text may be in English, Hindi, Telugu, Tamil or mixed (Hinglish). Never guess.
Return {"profile": {...}, "unclear": ["things mentioned but ambiguous"]}.`;
}

export function buildProfileParseUserPrompt(text: string): string {
  return text;
}
