# Yojana Saathi — Project Specification (MVP)

**Problem statement:** DVPS13 — Government Scheme Document Simplifier & Personalized Eligibility Assistant
**Build window:** 4 hours · **Budget:** ₹0 (free tiers only) · **Targets:** Chrome + Edge, mobile-first
**Builder:** Claude Code, working from this file phase by phase (see Section 14)

> Tagline: *"Find out if a scheme is for you — and exactly why."*

---

## 1. The problem, restated as a design brief

Government scheme documents are written for administrators, not citizens. A typical guideline PDF is 10–60 pages of legal language that hides five things a citizen actually needs: *am I eligible, why, what do I get, what papers do I need, and where do I go*. The people who most need welfare schemes (rural households, informal workers, elderly, first-generation literates, non-English speakers) are exactly the people least able to decode these documents.

Summarising the document is not enough. A summary still leaves the citizen to do the hardest part: mapping *their own life* onto the rules. The product must therefore behave like a knowledgeable helper at a Common Service Centre (CSC): it reads the rules, asks you a few questions, tells you where you stand, shows you the rule it used, and points you to other schemes if this one doesn't fit.

**Primary users**
- *Citizen* (low-to-medium digital literacy, often on a budget Android phone, may prefer Hindi/regional language, may prefer speaking to typing).
- *Helper* (CSC operator, NGO volunteer, ASHA/anganwadi worker, family member) who checks schemes on behalf of others.

**Primary job:** Turn one scheme document + one person's situation into a clear, trustworthy, explainable eligibility decision with next steps.

---

## 2. The solution in one paragraph

Yojana Saathi **compiles** a government scheme document into a machine-readable rulebook (eligibility rules, exclusions, benefits, documents, steps), with every rule linked to the exact sentence it came from. A **deterministic rules engine** (not the LLM) then evaluates the citizen's profile against those rules using three-valued logic (Pass / Fail / Unknown). The app asks only the questions it still needs, in the citizen's language, by voice or tap, and returns a verdict with per-criterion reasons, source quotes, missing information, near-miss hints ("you are ₹20,000 above the income limit"), a document checklist, application steps, and alternative schemes the same profile qualifies for.

**Core principle: *The AI reads. The rules decide. The citizen sees why.***

---

## 3. USP (what makes this different from "ChatGPT for schemes")

| # | Differentiator | Why it matters to judges |
|---|---|---|
| 1 | **Rules-as-code compiler.** The LLM converts prose into a typed JSON rule DSL; a pure TypeScript engine evaluates it. | The verdict is reproducible, testable, and cannot be hallucinated. Same input → same answer, every time. |
| 2 | **Clause-level citations with automatic verification.** Every rule carries a verbatim `sourceQuote`; the server checks the quote really exists in the document and marks it ✓ Verified or ⚠ Check manually. | Directly tackles LLM hallucination, the #1 objection to AI in government contexts. |
| 3 | **Three-valued logic → "missing information" is a first-class output.** | The problem statement explicitly asks for "what information is missing". Most solutions only do yes/no. |
| 4 | **Adaptive questioning.** Asks the most decisive unanswered question first (knock-out rules first). Typical check: 3–6 taps instead of a 25-field form. | Big UX win for low-literacy users; visibly "intelligent". |
| 5 | **Near-miss & what-if.** "You'd qualify if your income were below ₹2.5 lakh" / "You become eligible in 2 years". | Turns a "No" into actionable guidance. Very human, very demo-able. |
| 6 | **One profile, all schemes.** The same profile is evaluated against the whole scheme library to surface alternatives, ranked and explained. | Covers "which alternative schemes may be suitable" with real logic, not a vague LLM guess. |
| 7 | **Two-sided "missing info".** Missing from *the user* (unanswered questions) **and** missing/ambiguous in *the document* ("This document does not state an income limit"). | Shows depth of interpretation; honest about uncertainty. |
| 8 | **Vernacular + voice.** English, Hindi, Telugu, Tamil; speak answers, hear results read aloud (free browser Web Speech API). | Real-world inclusion; zero cost. |
| 9 | **"Tell me about yourself in one sentence."** Free-text/voice → pre-filled profile ("I'm a 45-year-old farmer with 2 acres and a ration card"). | Delightful demo moment. |
| 10 | **Privacy-first.** No login, no database; profile lives only in the browser. No names or ID numbers are ever collected. | Trust, and a clean answer to "what about data protection?" |

**One-line pitch:** *"Other tools summarise documents. Yojana Saathi turns a government PDF into executable, cited rules and gives every citizen an explainable eligibility decision in their own language in under a minute."*

---

## 4. How the problem is addressed (requirement → feature map)

| Requirement from problem statement | Feature | Section |
|---|---|---|
| What the scheme is | Plain-language "What is it" card (≤ 60 words, Grade-6 reading level) + jargon buster tooltips | 8.2 |
| Who can apply | "Who can apply" list auto-generated from rules, each with source quote | 8.2 |
| Whether they are likely eligible | Rules engine verdict: Eligible / Likely eligible / Need more info / Not eligible + confidence meter | 6 |
| Why / why not | Per-criterion ✓ ✗ ? rows with reason + "Show where it says this" | 8.4 |
| Documents needed | Interactive checklist ("I have this" toggles → readiness %) | 8.4 |
| Benefits | Benefit cards with amounts highlighted | 8.2 |
| How to apply | Numbered step timeline + online/offline mode + official link/helpline | 8.2 |
| What information is missing | Unanswered questions (user side) + gaps in document (document side) | 6.5 |
| Alternative schemes | Cross-scheme evaluation, top 3–5 ranked with reasons | 6.6 |
| Not just summarisation | Rule compilation + deterministic engine + verification + adaptive Q&A | 5, 6 |

---

## 5. System architecture

### 5.1 High-level diagram

```
┌───────────────────────────── BROWSER (Next.js client, mobile-first) ─────────────────────────────┐
│                                                                                                   │
│  Landing ─► Upload / Paste / Pick scheme ─► Scheme Explainer ─► Eligibility Check ─► Result      │
│                                                   ▲                    │                 │        │
│                                                   │        ┌───────────▼──────────┐      │        │
│  Web Speech API (STT/TTS) ◄──── voice ────────────┤        │  RULES ENGINE (pure  │      │        │
│                                                   │        │  TypeScript, no AI)  │      │        │
│  localStorage: profile, history, uploaded schemes │        │  evaluate()          │      │        │
│                                                   │        │  nextQuestion()      │      │        │
│  Scheme Library (seed JSON, pre-compiled) ────────┴──────► │  nearMiss()          │ ◄────┘        │
│                                                            │  rankAlternatives()  │               │
│                                                            └──────────────────────┘               │
└───────────────┬────────────────────────────────────────────────────────────────────────┬─────────┘
                │ HTTPS (JSON)                                                            │
┌───────────────▼───────────────── NEXT.JS API ROUTES (Vercel serverless, Node runtime) ─▼─────────┐
│  /api/extract        PDF/text/URL ─► text ─► section filter ─► LLM compile ─► zod validate       │
│                       ─► quote verification ─► Scheme JSON  (cached by sha256)                    │
│  /api/explain        evaluation JSON ─► LLM ─► short personalised explanation (template fallback)│
│  /api/profile-parse  free text / voice transcript ─► partial profile JSON                        │
│  /api/translate      scheme display strings ─► target language (cached)                         │
│  /api/ask            grounded Q&A over the document text (P1)                                     │
│                                                                                                   │
│  LLM Provider Layer:  Gemini Flash (primary, free tier)  ──fallback──►  Groq Llama 3.3 70B (free) │
│  Utilities: unpdf (PDF text), in-memory LRU cache, retry w/ exponential backoff, rate guard      │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Why this split

- **LLM is used only for language tasks:** reading the document (extraction), rewriting in plain language, translating, parsing free-text profiles, and writing a friendly explanation *of a decision that was already made*.
- **Decisions are made by code:** the engine is deterministic, unit-tested, runs instantly in the browser, and works offline once a scheme is loaded. This is the key technical talking point.
- **Seeds make the demo bullet-proof:** 8 schemes are pre-compiled into JSON in the repo, so the full flow (explain → check → result → alternatives) works with zero LLM calls. Live upload is the "wow" moment; seeds are the safety net.

### 5.3 Tech stack (all free)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (latest stable, App Router) + TypeScript | Single repo for UI + API; one-click Vercel deploy |
| Styling | Tailwind CSS | Mobile-first utilities; custom tokens in Section 9 |
| Icons | lucide-react | Always paired with text labels |
| Validation | zod | Validates every LLM output |
| PDF text | `unpdf` (server) | Text PDFs. Scanned PDFs → friendly message (OCR is P2 via tesseract.js) |
| LLM primary | Google Gemini API, Flash-class model, via AI Studio free key | JSON mode (`responseMimeType: "application/json"`). Model name via env var |
| LLM fallback | Groq, `llama-3.3-70b-versatile`, OpenAI-compatible endpoint | JSON mode (`response_format: {type:"json_object"}`). Smaller token budget → use section filter |
| Voice | Web Speech API (`webkitSpeechRecognition`, `speechSynthesis`) | Built into Chrome & Edge; free |
| Storage | localStorage (client) + in-memory LRU (server) | No database needed |
| Tests | Vitest | Rule engine only |
| Hosting | Vercel Hobby (free) | Or run locally for demo |

**Free-tier reality check (verify on the day):** Gemini's free tier is Flash/Flash-Lite only and quotas are low and per project (single-digit to ~15 requests/minute, a few hundred per day depending on model); check the live limits in Google AI Studio for your key. Groq's free tier is roughly 30 requests/minute but with a small tokens-per-minute cap on the 70B model, so long documents must be trimmed before sending. Free-tier Gemini inputs may be used by Google to improve models, so the app must never send names, Aadhaar numbers, phone numbers, or other PII. The architecture handles all this via caching, pre-compiled seeds, a section filter, and provider fallback.

### 5.4 Environment variables (`.env.local.example`)

```
GEMINI_API_KEY=            # from aistudio.google.com (free)
GEMINI_MODEL=gemini-2.5-flash   # replace with the current free Flash model name shown in AI Studio
GROQ_API_KEY=              # from console.groq.com (free, optional fallback)
GROQ_MODEL=llama-3.3-70b-versatile
LLM_PRIMARY=gemini         # gemini | groq
DEMO_MODE=false            # true = never call LLM; use seeds + templates only
```

---

## 6. The Rules Engine (heart of the product)

### 6.1 Canonical citizen profile

All documents are mapped onto this fixed vocabulary. Everything is optional (unknown = not yet asked).

```ts
// src/lib/types.ts
export type Lang = 'en' | 'hi' | 'te' | 'ta';

export interface CitizenProfile {
  age?: number;
  gender?: 'male' | 'female' | 'transgender';
  state?: string;                         // Indian state/UT name
  residence?: 'rural' | 'urban';
  annualFamilyIncome?: number;            // INR per year
  socialCategory?: 'general' | 'obc' | 'sc' | 'st' | 'ews';
  occupation?: 'farmer' | 'agri_labourer' | 'street_vendor' | 'artisan' | 'student'
             | 'salaried_private' | 'govt_employee' | 'self_employed' | 'unemployed'
             | 'homemaker' | 'retired';
  ownsAgriLand?: boolean;
  landHoldingAcres?: number;
  rationCardType?: 'aay' | 'phh' | 'bpl' | 'apl' | 'none';
  isIncomeTaxPayer?: boolean;
  isGovtEmployeeInFamily?: boolean;       // serving/retired govt employee or constitutional post holder
  monthlyPension?: number;                // INR
  isProfessional?: boolean;               // doctor, engineer, lawyer, CA, architect (registered, practising)
  hasPuccaHouse?: boolean;
  hasLpgConnection?: boolean;             // anyone in household
  hasBankAccount?: boolean;
  hasAadhaar?: boolean;
  maritalStatus?: 'single' | 'married' | 'widowed' | 'divorced';
  familySize?: number;
  numGirlChildrenUnder10?: number;
  disabilityPercent?: number;
  isPregnantOrLactating?: boolean;
  educationLevel?: 'none' | 'primary' | 'secondary' | 'higher_secondary' | 'graduate' | 'postgraduate';
  custom?: Record<string, boolean>;       // answers to scheme-specific yes/no questions
}
export type FieldKey = Exclude<keyof CitizenProfile, 'custom'>;
```

### 6.2 Field registry (`src/lib/fields.ts`)

One entry per `FieldKey`, used by the question wizard:

```ts
export interface FieldDef {
  key: FieldKey;
  type: 'number' | 'boolean' | 'enum';
  options?: { value: string; label: Record<Lang, string>; icon?: string }[];
  question: Record<Lang, string>;   // simple, one idea per question, ≤ 12 words
  help?: Record<Lang, string>;      // e.g. "Add up yearly earnings of everyone in your home"
  unit?: 'years' | 'INR' | 'acres' | 'percent' | 'people';
  quickPicks?: number[];            // number fields: tap-able chips, e.g. income 50000, 100000, 250000, 500000
  sensitive?: boolean;              // show "optional, stays on your phone" note
}
```
Claude Code writes all questions/labels directly in en/hi/te/ta. Number inputs always offer quick-pick chips plus a numeric keypad field (`inputMode="numeric"`). Income chips are in lakh format (₹1 lakh, ₹2.5 lakh…).

### 6.3 Rule DSL

```ts
export type Operator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'between'
                     | 'in' | 'not_in' | 'is_true' | 'is_false';

export interface Rule {
  id: string;                     // "r1", "x2"
  field: FieldKey | 'custom';
  operator: Operator;
  value?: number | string | boolean | (string | number)[];
  valueMax?: number;              // for 'between' (inclusive)
  customKey?: string;             // when field === 'custom', e.g. "is_landholder_family"
  customQuestion?: Record<Lang, string> | string; // yes/no question for custom rules
  label: string;                  // plain-language criterion: "Age between 18 and 40"
  sourceQuote: string;            // verbatim sentence from the document
  verified?: boolean;             // set by server quote verification
  confidence: number;             // 0–1, LLM self-reported
}

export interface RuleGroup {
  id: string;
  logic: 'ALL' | 'ANY';           // ALL = every rule must pass; ANY = at least one
  label: string;                  // "Basic eligibility", "Belongs to one of these groups"
  rules: Rule[];
}

export interface Scheme {
  id: string;
  name: string;
  ministry?: string;
  level: 'central' | 'state';
  state?: string;
  tags: string[];                               // "farmers", "women", "pension", "health", "housing", "education", "insurance", "loan"
  summary: {
    oneLiner: string;                           // ≤ 20 words
    whatIsIt: string;                           // ≤ 60 words, Grade-6 reading level
    benefits: { text: string; amount?: string }[];
    whoCanApply: string[];                      // derived from rules, plain words
    notFor: string[];                           // derived from exclusions
    documents: { name: string; why?: string; mandatory: boolean }[];
    howToApply: { title: string; detail: string }[];
    applyMode: 'online' | 'offline' | 'both' | 'unknown';
    officialUrl?: string;
    helpline?: string;
    deadline?: string;
  };
  eligibility: RuleGroup[];                     // ALL groups must pass
  exclusions: Rule[];                           // rule describes the EXCLUDED person; true ⇒ not eligible
  jargon: { term: string; meaning: string }[];
  documentGaps: string[];                       // things the document does not specify / is ambiguous about
  source: { kind: 'seed' | 'upload'; title: string; url?: string; extractedAt: string; wordCount: number };
  translations?: Partial<Record<Lang, Scheme['summary'] & { ruleLabels: Record<string, string> }>>;
}
```

### 6.4 Evaluation semantics (three-valued / Kleene logic)

```
evalRule(rule, profile):
  value missing in profile → UNKNOWN
  otherwise apply operator    → PASS | FAIL

evalGroup(ALL): any FAIL → FAIL; all PASS → PASS; else UNKNOWN
evalGroup(ANY): any PASS → PASS; all FAIL → FAIL; else UNKNOWN

exclusion rule: condition true → EXCLUDED (FAIL); false → PASS; missing → UNKNOWN

verdict:
  any group FAIL or any exclusion hit          → NOT_ELIGIBLE
  all groups PASS and all exclusions PASS      → ELIGIBLE
  no FAIL and knownRatio ≥ 0.75                → LIKELY_ELIGIBLE
  otherwise                                    → NEED_MORE_INFO

knownRatio  = (# rules with PASS/FAIL) / (# total rules incl. exclusions)
matchScore  = (# PASS) / (# total rules)            // used for ranking alternatives
```

Output type:

```ts
export type Status = 'PASS' | 'FAIL' | 'UNKNOWN';
export type Verdict = 'ELIGIBLE' | 'LIKELY_ELIGIBLE' | 'NEED_MORE_INFO' | 'NOT_ELIGIBLE';

export interface RuleResult { rule: Rule; status: Status; kind: 'eligibility' | 'exclusion'; nearMiss?: string; }
export interface Evaluation {
  schemeId: string;
  verdict: Verdict;
  knownRatio: number;
  matchScore: number;
  groups: { group: RuleGroup; status: Status; results: RuleResult[] }[];
  exclusions: RuleResult[];
  missingFields: FieldKey[];          // unknown fields, ordered by importance
  missingCustom: string[];            // unanswered custom yes/no questions
}
```

### 6.5 Next-question selection (`nextQuestion.ts`)

Goal: reach a confident verdict in the fewest questions.

```
for each unknown field f referenced by the current scheme:
  score(f) = Σ over rules using f of weight
     weight = 3 if rule is in an ALL group or is an exclusion (knock-out)
            = 1 if rule is in an ANY group
  + 0.5 × (# other library schemes that also use f)   // helps alternatives later
ask argmax score(f); ties → cheaper question first (boolean < enum < number)
stop when: verdict is ELIGIBLE or NOT_ELIGIBLE, or no unknowns remain, or user taps "Show my result now".
```
After a NOT_ELIGIBLE knock-out, show the result immediately (don't make the user answer pointless questions), with an optional "Answer 2 more to find other schemes" prompt.

### 6.6 Near-miss (`nearMiss.ts`) and alternatives (`rank.ts`)

Near-miss for FAIL numeric rules:
- `lte`/`lt` income: "Your family income is ₹X above the limit of ₹Y."
- `gte` age: "You will become eligible in N years."
- `lte` age: "The age limit is Y; you crossed it N years ago." (then point to alternatives)
- `between`: whichever edge failed.

Alternatives: evaluate the profile against every library scheme (seeds + uploads), drop NOT_ELIGIBLE, sort by verdict rank (ELIGIBLE > LIKELY > NEED_MORE_INFO), then `matchScore`, then tag overlap with the current scheme. Show top 5 with the 2 strongest passing criteria as the "why".

### 6.7 Engine tests (must exist, Vitest)

Minimum cases: each operator; ALL vs ANY with unknowns; exclusion hit; LIKELY threshold; near-miss strings; nextQuestion prefers knock-out fields; alternatives exclude NOT_ELIGIBLE. Plus 3 persona tests against seed schemes (Section 12).

---

## 7. AI / LLM layer

### 7.1 Provider abstraction (`src/lib/llm/provider.ts`)

```ts
export interface LLMRequest { system: string; user: string; json: boolean; maxTokens?: number; temperature?: number; }
export async function callLLM(req: LLMRequest): Promise<string>
```
- Implement with plain `fetch` (no SDK churn): Gemini REST `generateContent` with `generationConfig.responseMimeType = "application/json"` when `json`; Groq OpenAI-compatible `chat/completions` with `response_format: { type: "json_object" }`.
- `temperature: 0.1` for extraction/parsing, `0.4` for explanations.
- Retry on 429/5xx with exponential backoff (1s, 2s, 4s), then fall back to the other provider, then throw a typed `LLMUnavailableError`.
- If `DEMO_MODE=true`, never call; throw `LLMUnavailableError` so callers use their fallbacks.
- `safeJsonParse`: strip ```json fences, find first `{`…last `}`, `JSON.parse`, then zod-validate. On validation failure, retry **once** sending the zod error back to the model ("Fix these errors and return only JSON").

### 7.2 Document pipeline (`/api/extract`)

```
input: { text?: string; fileBase64?: string (PDF ≤ 4 MB); url?: string (P1); lang: Lang }
1. Get text      PDF → unpdf; URL → fetch + strip tags (P1); text as-is
2. Guard         < 200 chars of text from a PDF → error code SCANNED_PDF ("This looks like a scanned copy. Paste the text or try another file.")
3. Normalise     collapse whitespace, remove page headers/footers repeated ≥ 3 times
4. Cache check   sha256(normalisedText) → return cached Scheme if present
5. Section filter If text > 60,000 chars (Gemini) or > 18,000 chars (Groq): split into paragraphs, score by keywords
                  (eligib, criteria, benefit, assistance, amount, ₹, Rs, document, apply, application, exclusion,
                   not eligible, income, age, years, BPL, land, family, beneficiary, procedure), keep top paragraphs
                   in original order up to the budget.
6. Compile       callLLM(EXTRACTION prompt) → JSON
7. Validate      zod SchemeSchema; retry once on failure
8. Verify quotes For each rule: normalise quote + text (lowercase, strip punctuation, collapse spaces);
                  verified = exact substring OR ≥ 80% of the quote's word 5-grams found in text.
                  Unverified rules stay but show "⚠ Check this in the original document".
9. Sanity fixes  Drop rules whose field is not a FieldKey and not 'custom'; clamp confidence 0–1; ensure unique ids.
10. Return       { scheme, stats: { originalWords, simplifiedWords, verifiedRules, totalRules, provider, ms } }
```

### 7.3 Prompts (`src/lib/llm/prompts.ts`) — use these verbatim, adjust only if needed

**EXTRACTION_SYSTEM**
```
You are a legal-to-plain-language compiler for Indian government welfare schemes.
You convert a scheme document into a strict JSON object that a computer program will use
to decide eligibility. Accuracy matters more than completeness. Never invent facts.

RULES
1. Output ONLY a JSON object matching the schema. No markdown, no commentary.
2. Every eligibility rule and exclusion MUST include "sourceQuote": an exact, verbatim sentence
   or phrase copied from the document (max 40 words). If you cannot quote it, do not create the rule.
3. Map each condition to one of these profile fields where possible:
   {{FIELD_LIST_WITH_TYPES_AND_ENUM_VALUES}}
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
10. If the text is not a government scheme, return {"error":"NOT_A_SCHEME"}.
```

**EXTRACTION_USER**
```
Return JSON with this exact shape:
{{SCHEME_JSON_SHAPE_WITH_EXAMPLE_VALUES}}

DOCUMENT TITLE (if known): {{title}}
DOCUMENT TEXT:
<<<
{{text}}
>>>
```
(Build `SCHEME_JSON_SHAPE` from the `Scheme` type minus `id`, `source`, `translations`, `verified`; include one short worked example rule for an age range and one for an exclusion.)

**EXPLAIN_SYSTEM** (`/api/explain`)
```
You explain a government scheme eligibility result to a citizen with limited reading skills.
Use ONLY the facts in the provided JSON. Do not add rules, amounts, or advice not present.
Write in {{languageName}}. Use short sentences and a warm, respectful tone. Address the person as "you".
Maximum 110 words. Structure: 1) the result in one sentence, 2) the main reason(s),
3) what to do next (missing info, documents, or other schemes). Never promise approval;
say "based on what you told us". Return JSON: {"explanation": "..."}.
```
User content = `{ schemeName, verdict, passed: [labels], failed: [{label, nearMiss}], unknown: [labels], documentGaps, topAlternatives: [names] }` — no profile values that could identify anyone.

**Template fallback** (no LLM): build the same 3-part message from string templates in `i18n/strings.ts` so the result page never breaks.

**PROFILE_PARSE_SYSTEM** (`/api/profile-parse`)
```
Extract facts about a person from their description into JSON using ONLY these keys:
{{FIELD_LIST_WITH_TYPES_AND_ENUM_VALUES}}
Include a key only if it is clearly stated or directly implied (e.g. "I farm my own 2 acres" →
occupation "farmer", ownsAgriLand true, landHoldingAcres 2). Convert lakh/thousand to numbers.
The text may be in English, Hindi, Telugu, Tamil or mixed (Hinglish). Never guess.
Return {"profile": {...}, "unclear": ["things mentioned but ambiguous"]}.
```
UI then shows the extracted facts as editable chips: "We understood: 45 years · Farmer · 2 acres · Ration card (PHH). Correct?"

**TRANSLATE_SYSTEM** (`/api/translate`)
```
Translate the JSON values (not keys) into {{languageName}} for rural citizens: simple everyday words,
not formal/Sanskritised vocabulary. Keep numbers, ₹ amounts, scheme names, URLs unchanged.
Return the same JSON shape.
```

**ASK_SYSTEM** (`/api/ask`, P1)
```
Answer the citizen's question using only the document excerpt. Reply in {{languageName}}, ≤ 80 words.
Include one short verbatim quote as evidence. If the document does not answer it, say so plainly
and suggest the official helpline/website if present. Return {"answer": "...", "quote": "..."}.
```

### 7.4 API contracts

| Route | Request | Response | Fallback |
|---|---|---|---|
| `POST /api/extract` | `{ text? , fileBase64?, fileName?, url?, lang }` | `{ scheme, stats }` or `{ error: 'SCANNED_PDF' \| 'NOT_A_SCHEME' \| 'TOO_LARGE' \| 'LLM_UNAVAILABLE' }` | Show error with next step; suggest trying a library scheme |
| `POST /api/explain` | `{ summaryPayload, lang }` | `{ explanation, source: 'llm' \| 'template' }` | Template |
| `POST /api/profile-parse` | `{ text, lang }` | `{ profile, unclear }` | Skip to wizard |
| `POST /api/translate` | `{ schemeId, payload, lang }` | `{ payload }` | Show English + "Translation unavailable right now" |
| `POST /api/ask` (P1) | `{ schemeId, question, lang, context }` | `{ answer, quote }` | Hide feature |

All routes: `export const runtime = 'nodejs'`, input size limits, zod-validated bodies, errors as `{ error, message }` with HTTP status, never leak API keys, per-IP simple in-memory rate guard (e.g., 20 req/min).

### 7.5 Caching & quota strategy
- Server LRU (max 100 entries) keyed by sha256 of normalised text (+lang for translate/explain).
- Client caches translated schemes and explanations in localStorage keyed by `schemeId:lang:evaluationHash`.
- Seed schemes are shipped pre-compiled; `scripts/build-seeds.ts` (optional) can pre-generate `hi/te/ta` translations so the demo needs zero live calls.
- Explanation is requested only once per result view (debounced), never on each answer.

---

## 8. Product flows & screens

### 8.1 Information architecture

```
/                       Landing: language picker, two big actions, library preview
/upload                 Upload PDF · Paste text · (P1) Paste link · Try a sample
/scheme/[id]            Scheme Explainer (simplified view)
/scheme/[id]/check      Eligibility check (question wizard) → Result (same page, phase switch)
/discover               "Find schemes for me": one-sentence intro → wizard across ALL schemes → ranked list
/profile                What we know about you (edit/clear) — stored on this device only
```
Uploaded schemes get id `u-<first 8 of sha256>` and are saved to localStorage so they appear in the library.

### 8.2 Scheme Explainer (`/scheme/[id]`)

Order on mobile (single column):
1. **Header:** scheme name, ministry, level badge (Central / State), language switcher, 🔊 "Read aloud".
2. **"In simple words"**: `oneLiner` large + `whatIsIt`. Readability strip: "Original: 8,400 words · ~45 min read → Here: 180 words · 1 min".
3. **What you get:** benefit cards, amount in large type.
4. **Who can apply / Who cannot:** two short lists (from rules/exclusions) — each item has a small "source" icon opening the **Source drawer** (verbatim quote + ✓ Verified / ⚠ Check manually).
5. **Papers you need:** checklist preview.
6. **How to apply:** numbered steps (this *is* a sequence, so numbering is appropriate), online/offline badge, official link, helpline (tap-to-call `tel:`).
7. **Not clear in the document:** `documentGaps` in a calm info box.
8. **Sticky bottom CTA:** "Check if I can apply".
9. Jargon: difficult terms in any displayed text are underlined with dotted line; tap → tooltip meaning.
10. (P1) "Ask a question about this scheme" input with mic.

### 8.3 Eligibility check (`/scheme/[id]/check`)

- If profile exists in localStorage → pre-fill and only ask unknown fields; show "Using what you told us before · Edit".
- First screen (optional): **"Tell us about yourself in one line"** text box + big mic button + "Skip, ask me questions".
- **Question card**: one question per screen, huge tap targets (≥ 56 px), options as chips with icons, number fields with quick-pick chips, "I don't know" always available (keeps field UNKNOWN), "Back".
- Mic button on every question: speech → match to options (fuzzy, multilingual synonyms: "haan/avunu/aamaa" = yes; "nahi/ledu/illai" = no; digits and "lakh").
- **Live criteria panel** (collapsible on mobile, sidebar on desktop): each criterion flips from ? to ✓ / ✗ as answers come in. This makes the engine's reasoning visible — a key demo moment.
- Progress: "About N more questions" (computed from unknowns remaining).
- Custom rules become yes/no questions using `customQuestion`.

### 8.4 Result (same route, result phase)

1. **Verdict stamp** (signature visual, Section 9): ELIGIBLE (green, ✓), LIKELY ELIGIBLE (green-outline, ✓?), NEED MORE INFO (amber, ?), NOT ELIGIBLE (red, ✗). Text + icon + colour, never colour alone. Confidence meter "Based on N of M rules".
2. **Personal explanation** (from `/api/explain` or template), 🔊 read aloud.
3. **Why — criteria breakdown:** rows grouped as "You meet", "You don't meet" (with near-miss line), "We still need to know" (tap to answer inline). Each row: plain label + "See the rule" → source drawer.
4. **What-if chips** (P1): for failed numeric rules, "What if my income was ₹2 lakh?" → re-evaluate instantly (does not overwrite profile).
5. **Papers checklist:** toggles "I have this" → readiness bar "4 of 6 ready". Mandatory items marked.
6. **How to apply:** steps + official link + helpline.
7. **Other schemes for you:** horizontal cards (scroll on mobile): name, verdict chip, 1-line benefit, 2 reasons, "Open".
8. **Share bar:** "Share on WhatsApp" (`https://wa.me/?text=` with a short plain-text summary — no personal data), "Print / Save as PDF" (`window.print()` with print stylesheet), "Start again".
9. Disclaimer (small, always visible): "This is a guide, not an official decision. Final approval is by the government office."

### 8.5 Discover (`/discover`)
One-line intro (or wizard of the ~8 most common fields ranked by how many library schemes use them) → evaluate all schemes → list sorted by verdict with benefit highlights and filters by tag (Farmers, Women, Pension, Health, Insurance, Education, Housing, Loans).

### 8.6 States to design (don't skip)
Loading extraction (staged messages: "Reading the document…", "Finding the rules…", "Checking every rule against the text…", "Writing it in simple words…"), scanned PDF, not a scheme, LLM unavailable (offer library), empty library, speech not supported (hide mic, no error), offline (library + engine still work).

---

## 9. UI/UX design system

### 9.1 Design direction
The subject is the Indian public-service counter: ink stamps, forms, ration cards, and a helpful person across the desk. We borrow **one** element from that world — the **rubber-stamp verdict** — and keep everything else quiet, spacious, and friendly. The interface should feel like a patient helper, not a government portal and not a tech startup.

### 9.2 Tokens

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1E2A5A` | Primary text, headers, primary buttons (stamp-ink indigo) |
| `paper` | `#F7F8FC` | App background (cool off-white, not cream) |
| `marigold` | `#E8A317` | Single accent: focus rings, highlights of ₹ amounts, active chips |
| `leaf` | `#1F7A4D` | Eligible / pass |
| `sindoor` | `#B83A2E` | Not eligible / fail |
| `haldi` | `#B7791F` | Unknown / need info (on light amber `#FFF4DA`) |
| `slate` | `#5B6275` | Secondary text |

Contrast: all text ≥ 4.5:1 on its background; verdict colours used with icons and words.

### 9.3 Typography
- Headings: **Baloo 2** (Latin + Devanagari), **Baloo Tammudu 2** (Telugu), **Baloo Thambi 2** (Tamil) — rounded, warm, readable; loaded via `next/font/google`.
- Body: **Noto Sans**, **Noto Sans Devanagari**, **Noto Sans Telugu**, **Noto Sans Tamil**.
- Font stack switches by `lang` attribute on `<html>`.
- Base size 18 px mobile, line-height 1.6 (Indic scripts need extra leading); scale 18 / 22 / 28 / 36. Line length ≤ 70 characters. Sentence case everywhere; no all-caps labels.

### 9.4 Signature element: the verdict stamp
A circular SVG seal (double ring, verdict word curved along the ring, big icon centre, slight −8° rotation, subtle ink-texture via SVG noise filter). On first reveal it "stamps" once: scale 1.15 → 1 with a short 180 ms settle. Respect `prefers-reduced-motion` (no animation). This is the only decorative motion in the app.

### 9.5 Layout & interaction rules
- Mobile-first single column, max content width 720 px; desktop adds the live criteria panel as a right sidebar.
- Left-aligned text; generous spacing; cards only where content is a distinct object (benefit, alternative scheme), not everything.
- Tap targets ≥ 48 px (question chips 56 px). Sticky bottom primary action on mobile.
- Every icon has a text label. Every audio feature has a text equivalent.
- Visible keyboard focus (marigold 3 px ring). Semantic HTML, `aria-live="polite"` for criteria updates and verdict.
- Copy: plain verbs, "you", ≤ 12 words per question. Buttons say exactly what happens: "Check if I can apply", "Show my result", "Share on WhatsApp".
- Numbers formatted Indian style (`Intl.NumberFormat('en-IN')` → ₹2,50,000) and in words for large amounts ("₹2.5 lakh").

### 9.6 Landing page hero
Not a stats banner. The hero is the product itself: a large prompt **"Which scheme do you want to understand?"** with three big actions — **Upload a scheme document**, **Pick from common schemes**, **Find schemes for me** — plus the language switcher at the very top (first-time visitors pick language before anything else). Below: a strip of 8 library schemes as tappable chips.


---

## 10. Multilingual & voice

- **Languages:** English (`en`), Hindi (`hi`), Telugu (`te`), Tamil (`ta`). Adding one more = add to `Lang`, strings file, fonts, speech locale map.
- **Static UI strings:** `src/lib/i18n/strings.ts`, hand-written by Claude Code for all 4 languages. `useLang()` hook reads/writes `localStorage['ys:lang']` and sets `<html lang>`.
- **Scheme content:** English canonical from extraction; other languages via `/api/translate` on first switch, cached. Seeds may ship pre-translated.
- **Speech-to-text:** `window.SpeechRecognition || window.webkitSpeechRecognition`, `lang` = `en-IN | hi-IN | te-IN | ta-IN`, `interimResults: true`, single utterance. Feature-detect; hide mic if unsupported. Needs HTTPS or localhost.
- **Answer matching:** `matchSpokenAnswer(transcript, fieldDef, lang)` — normalise, check yes/no synonyms per language, match option labels (all languages, fuzzy with simple Levenshtein ≤ 2), parse numbers including "lakh/लाख/లక్ష/லட்சம்" and "hazaar/हज़ार". If no match, show the transcript and ask the user to tap.
- **Text-to-speech:** `speechSynthesis` with a voice whose `lang` starts with the target locale; if none exists (common for Telugu/Tamil on some desktops), hide the 🔊 button for that language rather than reading with a wrong voice.

---

## 11. Project structure

```
yojana-saathi/
├─ SPEC.md                      ← this file
├─ CLAUDE.md                    ← conventions for Claude Code (Section 14.2)
├─ .env.local.example
├─ data/raw/                    ← official scheme text pasted from myscheme.gov.in (for seed building)
├─ scripts/build-seeds.ts       ← optional: run extractor over data/raw → src/data/schemes
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx             fonts, lang attr, header with language switcher
│  │  ├─ page.tsx               landing
│  │  ├─ upload/page.tsx
│  │  ├─ discover/page.tsx
│  │  ├─ profile/page.tsx
│  │  ├─ scheme/[id]/page.tsx   explainer
│  │  ├─ scheme/[id]/check/page.tsx   wizard + result
│  │  └─ api/{extract,explain,profile-parse,translate,ask}/route.ts
│  ├─ components/
│  │  VerdictStamp.tsx  CriterionRow.tsx  CriteriaPanel.tsx  QuestionCard.tsx  ChoiceChips.tsx
│  │  NumberQuickPick.tsx  MicButton.tsx  SpeakButton.tsx  SourceDrawer.tsx  JargonText.tsx
│  │  BenefitCard.tsx  DocChecklist.tsx  ApplySteps.tsx  AltSchemeCard.tsx  ShareBar.tsx
│  │  LanguageSwitcher.tsx  ReadabilityStrip.tsx  LoadingStages.tsx  Disclaimer.tsx
│  ├─ lib/
│  │  ├─ types.ts  fields.ts  format.ts (₹, lakh)  readability.ts  storage.ts
│  │  ├─ engine/ evaluate.ts  nextQuestion.ts  nearMiss.ts  rank.ts  index.ts
│  │  ├─ engine/__tests__/ evaluate.test.ts  nextQuestion.test.ts  personas.test.ts
│  │  ├─ llm/ provider.ts  prompts.ts  schema.ts (zod)  verifyQuotes.ts  sectionFilter.ts  cache.ts  json.ts
│  │  ├─ pdf.ts
│  │  ├─ i18n/ strings.ts  useLang.ts
│  │  └─ speech/ useSpeechInput.ts  speak.ts  matchAnswer.ts
│  └─ data/schemes/ index.ts  pm-kisan.json  apy.json  pmjjby.json  pmsby.json  ssy.json  pmuy.json  pmjay.json  pm-svanidhi.json
└─ public/samples/              ← a sample scheme PDF/TXT for the live demo
```

---

## 12. Seed scheme library (8 central schemes)

Build these as `src/data/schemes/*.json`. **Preferred:** a teammate pastes each scheme's official eligibility/benefits/documents text from **myscheme.gov.in** (or the scheme's own portal) into `data/raw/<id>.txt` and runs the extractor, then reviews the output — this gives real, verified quotes and tests the pipeline. **Fallback:** Claude Code authors the JSON from the notes below with `verified: false`, and a human checks every number against the official source before the demo. Rules change; the notes below are starting points, not authority.

| id | Scheme | Key rules (map to fields) | Main benefit |
|---|---|---|---|
| `pm-kisan` | PM-KISAN | ALL: `ownsAgriLand is_true`. Exclusions: `isIncomeTaxPayer`, `isGovtEmployeeInFamily` (label notes Group D/MTS exception), `monthlyPension gte 10000`, `isProfessional`, custom `is_institutional_landholder` | ₹6,000/year in 3 instalments of ₹2,000 to bank account; e-KYC required |
| `apy` | Atal Pension Yojana | ALL: `age between 18–40`, `hasBankAccount`. Exclusion: `isIncomeTaxPayer` | Guaranteed pension ₹1,000–₹5,000/month from age 60 |
| `pmjjby` | PM Jeevan Jyoti Bima Yojana | ALL: `age between 18–50`, `hasBankAccount` | ₹2 lakh life cover; low yearly premium (verify current amount) auto-debited |
| `pmsby` | PM Suraksha Bima Yojana | ALL: `age between 18–70`, `hasBankAccount` | Accident cover ₹2 lakh (death/full disability), ₹1 lakh partial; ~₹20/year |
| `ssy` | Sukanya Samriddhi Yojana | ALL: `numGirlChildrenUnder10 gte 1` (custom note: max 2 girls per family, twins exception) | High-interest savings account for the girl child, tax benefits |
| `pmuy` | PM Ujjwala Yojana | ALL: `gender eq female`, `age gte 18`, `hasLpgConnection is_false`; ANY: `rationCardType in [aay, phh, bpl]` / `socialCategory in [sc, st]` / custom `poor_household_declaration` | Free LPG connection for women of poor households |
| `pmjay` | Ayushman Bharat PM-JAY | ANY: `age gte 70` / custom `is_listed_family` ("Is your family on the Ayushman list? Check at beneficiary.nha.gov.in") / `rationCardType in [aay]` | Cashless hospital treatment up to ₹5 lakh per family per year |
| `pm-svanidhi` | PM SVANidhi | ALL: `occupation eq street_vendor`, custom `has_vending_certificate_or_lor` | Collateral-free working-capital loans in tranches + interest subsidy + digital cashback (verify current amounts) |

### 12.1 Persona test fixtures (also used in the demo)

| Persona | Profile | Expected verdicts |
|---|---|---|
| **Lakshmi** | 38, female, widowed, rural, agri_labourer, ownsAgriLand false, income ₹90,000, ration PHH, no LPG, bank yes, 1 girl under 10, not taxpayer | PM-KISAN **NOT_ELIGIBLE** (no own land); PMUY **ELIGIBLE**; SSY **ELIGIBLE**; APY, PMJJBY, PMSBY **ELIGIBLE** |
| **Ramesh** | 45, male, farmer, owns 2 acres, income ₹1.8 lakh, bank yes, not taxpayer, no govt job/pension, not professional, not institutional | PM-KISAN **ELIGIBLE**; APY **NOT_ELIGIBLE** with near-miss "age limit is 40"; PMJJBY, PMSBY **ELIGIBLE** |
| **Retired officer** | 62, farmer, owns land, `isGovtEmployeeInFamily` true, pension ₹25,000/month | PM-KISAN **NOT_ELIGIBLE** by exclusion (engine must show exclusion as the reason) |
| **Farhan** | 29, urban, street_vendor, income ₹1.2 lakh, bank yes, vending certificate unknown | PM SVANidhi **LIKELY_ELIGIBLE / NEED_MORE_INFO** asking the certificate question; APY **ELIGIBLE** |

---

## 13. Priorities and 4-hour plan

### 13.1 Scope tiers
- **P0 (must ship):** engine + tests, 8 seeds, landing, explainer, wizard, result with criteria/source drawer/near-miss/documents/steps/alternatives, upload (PDF + paste) with live extraction and quote verification, template explanation, English + Hindi, mobile responsive, disclaimer.
- **P1 (should):** LLM explanation, Telugu + Tamil, voice input/output, one-line profile parse, what-if chips, WhatsApp share + print, discover page, readability strip.
- **P2 (stretch):** URL import, Ask-the-document Q&A, OCR for scanned PDFs (tesseract.js), PWA offline install, CSC "helper mode" (check for multiple family members).

### 13.2 Timeline (team of 3–4)

| Time | Claude Code (driver) | Teammate B (data) | Teammate C (design/pitch) |
|---|---|---|---|
| 0:00–0:20 | Phase 0–1 start: scaffold, types, fields | Get free Gemini + Groq keys; paste official text for 8 schemes into `data/raw` | Pick demo persona, draft pitch, prepare sample PDF (e.g., PM-KISAN guidelines) |
| 0:20–1:00 | Phase 1: engine + tests | Review seed JSON as it appears; fix numbers | Review tokens/copy; test on phone |
| 1:00–1:50 | Phase 2–3: seeds, explainer, wizard, result | Test personas, log bugs | Hindi copy review |
| 1:50–2:40 | Phase 4: LLM layer, upload, extract, explain | Try 3–4 real PDFs, tune prompts | Screenshots for slides |
| 2:40–3:20 | Phase 5: i18n + voice + alternatives + share | Voice tests in Hindi/Telugu | Rehearse demo |
| 3:20–3:45 | Phase 6: polish, error states, demo mode, a11y | Final data check | Final slides |
| 3:45–4:00 | Phase 7: deploy to Vercel, smoke test on Chrome + Edge + phone | — | Full rehearsal |

**Rule:** commit to git after every phase. If behind at 2:40, cut P1 items in this order: Tamil → what-if → discover page → profile parse.

---

## 14. Building with Claude Code

### 14.1 Setup
```bash
mkdir yojana-saathi && cd yojana-saathi
# put SPEC.md here, then:
git init
claude
```
Use **plan mode** (Shift+Tab) for the first prompt of each phase so you can approve the plan before files change. Keep one Claude Code session; if context gets long, run `/compact` between phases.

### 14.2 CLAUDE.md (ask Claude Code to create this in Phase 0)
```
# Yojana Saathi — working agreement
- Source of truth: SPEC.md. Build one phase at a time; stop and summarise after each phase.
- Stack: Next.js App Router + TS strict + Tailwind + zod + Vitest. No other UI kits unless asked.
- The rules engine in src/lib/engine is pure TS: no React, no fetch, no LLM. Keep it 100% unit-tested.
- LLM calls only in src/app/api/* via src/lib/llm/provider.ts. Never call LLMs from the client.
- Every LLM response is zod-validated. Every API route has a non-LLM fallback path.
- Never send names, phone, Aadhaar or other PII to any API.
- Mobile-first: design at 375px, then scale up. Tap targets ≥ 48px. Text + icon, never colour alone.
- All user-facing strings go through i18n/strings.ts.
- Before finishing a phase: `npm run lint && npm run test && npm run build` must pass.
- Commit message per phase: "phase N: <summary>".
```

### 14.3 Phase prompts (paste one at a time)

**Phase 0 — Orientation**
> Read SPEC.md completely. Create CLAUDE.md from Section 14.2. Then give me a short plan for Phases 1–7 with the files each phase touches. Don't write app code yet.

**Phase 1 — Scaffold + engine**
> Phase 1: Scaffold the Next.js app (TypeScript, Tailwind, App Router, src dir) in the current folder. Add zod, vitest, lucide-react, unpdf. Implement src/lib/types.ts, src/lib/fields.ts (all fields, questions in en/hi/te/ta, quick picks), and the full engine in src/lib/engine (evaluate, nextQuestion, nearMiss, rank) exactly as in SPEC Section 6. Write the Vitest tests from Section 6.7. Run tests until green.

**Phase 2 — Seeds + library + explainer**
> Phase 2: Create the 8 seed schemes in src/data/schemes per SPEC Section 12 (if data/raw has text, base quotes on it; otherwise set verified=false). Add persona tests from 12.1 and make them pass. Build the design tokens and fonts from Section 9, the layout with language switcher (en/hi first), the landing page (9.6), and the Scheme Explainer page (8.2) with SourceDrawer and JargonText.

**Phase 3 — Wizard + result**
> Phase 3: Build /scheme/[id]/check per SPEC 8.3 and 8.4: question cards driven by nextQuestion, "I don't know", live CriteriaPanel with aria-live, early stop on knock-out, VerdictStamp (9.4), criteria breakdown with near-miss, DocChecklist with readiness bar, ApplySteps, alternatives via rank(), template explanation, disclaimer. Persist profile in localStorage (storage.ts). Mobile-first.

**Phase 4 — AI layer + upload**
> Phase 4: Implement src/lib/llm (provider with Gemini primary and Groq fallback via fetch, retries, DEMO_MODE; prompts from Section 7.3; zod schema; json helper; sectionFilter; verifyQuotes; LRU cache) and API routes /api/extract, /api/explain, /api/profile-parse per Section 7. Build /upload (PDF upload ≤4MB, paste text, sample button) with LoadingStages and all error states from 8.6. Save uploaded schemes to localStorage and include them in the library and alternatives. Show verification badges and the readability strip.

**Phase 5 — Language + voice + extras**
> Phase 5: Add Telugu and Tamil (strings, fonts), /api/translate with caching, voice input (useSpeechInput + matchAnswer, Section 10) on question cards and the one-line profile box, SpeakButton for explainer and result, what-if chips, ShareBar (WhatsApp link + print stylesheet), and the /discover page.

**Phase 6 — Polish**
> Phase 6: Audit against SPEC Sections 9.5 and 15. Check 375px, 768px and 1280px layouts, keyboard focus, reduced motion, contrast, empty/error/offline states, and that DEMO_MODE=true still gives a complete flow. Fix anything failing. Remove unused code.

**Phase 7 — Deploy**
> Phase 7: Prepare for Vercel deploy: README with setup, env vars and demo script, make sure `npm run build` passes with no env vars set (DEMO fallback). List the exact steps for me to deploy.

### 14.4 If something breaks
Tell Claude Code the exact error and the phase: "Phase 4 /api/extract returns 500 on this PDF: <error>. Diagnose from logs, fix, add a test if it's engine-related." Don't let it rewrite working phases.

---

## 15. Acceptance criteria (definition of done)

- [ ] Selecting a seed scheme shows a simplified explainer with benefits, who can/can't apply, documents, steps, and document gaps.
- [ ] Every eligibility row can open its source quote; verified/unverified is shown.
- [ ] Wizard reaches a verdict for each persona in ≤ 7 questions; knock-out answers end the check early.
- [ ] Results show verdict + reasons + near-miss + missing info + documents + steps + ≥ 1 alternative (for personas that have one).
- [ ] All persona tests pass; engine test coverage covers every operator.
- [ ] Uploading a real text-based scheme PDF produces a usable scheme in under ~30 s, or a clear, actionable error.
- [ ] App works end-to-end with `DEMO_MODE=true` (no API keys).
- [ ] Hindi UI works; voice input works in Chrome and Edge (on HTTPS/localhost).
- [ ] No horizontal scroll at 360 px; tap targets ≥ 48 px; Lighthouse accessibility ≥ 90.
- [ ] No PII collected; disclaimer visible on result.

---

## 16. Demo script (3 minutes)

1. **Hook (20 s):** Hold up the printed PM-KISAN guidelines. "This is how the government explains a ₹6,000 benefit. Lakshmi, an agricultural labourer, would have to read all of this to learn it isn't for her — and never learn what *is*."
2. **Upload (40 s):** Upload the PDF live. Loading stages narrate the pipeline. Show the explainer in simple words, the readability strip (e.g., "45 min → 1 min"), and open one source quote with ✓ Verified.
3. **Check, in Hindi, by voice (50 s):** Switch to हिन्दी. Speak Lakshmi's one-line intro. Profile chips appear. Answer one question by voice. Watch the criteria panel flip ✓ ✗.
4. **Verdict (30 s):** The stamp lands: *Not eligible* — "Only families that own farm land can apply", with the exact clause. Point out: *the AI read it; the rules decided; here's why.*
5. **Turn a no into a yes (30 s):** Alternatives: Ujjwala (free LPG), Sukanya Samriddhi for her daughter, PMSBY accident cover — each with reasons, documents checklist, and "Share on WhatsApp".
6. **Close (10 s):** "Explainable, cited, multilingual eligibility — built on free tools, ready for every CSC in India."

Backup: if the network or API fails, switch to the pre-compiled PM-KISAN seed (identical flow) — never debug on stage.

---

## 17. Judging criteria mapping

| Criterion | What to show |
|---|---|
| Innovation & creativity | Rules-as-code compiler, verified citations, three-valued logic, near-miss, adaptive questioning, verdict stamp |
| Technical implementation | Hybrid LLM + deterministic engine, zod-validated structured output, quote verification, provider fallback, caching, unit tests |
| Real-world impact | Vernacular + voice for low literacy, alternatives turn "no" into benefits, CSC/helper use, privacy by design, zero cost to run |
| UX | 3–6 taps to a verdict, one question per screen, live reasoning panel, readable type, accessible, mobile-first |
| Completeness | Full flow for 8 schemes + live upload; all 9 required outputs from the problem statement covered (Section 4) |

---

## 18. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Free-tier rate limits / 429 during demo | Seeds pre-compiled, cache, provider fallback, `DEMO_MODE`, template explanations |
| LLM invents a rule | Quote requirement + automatic verification + ⚠ badge + zod schema + engine never trusts the LLM's verdict |
| Messy/long PDFs | Section filter, header/footer stripping, size guard, clear errors |
| Scanned PDFs | Detect and advise; OCR is P2 |
| Speech unsupported / missing voice | Feature detection; hide controls gracefully; text always available |
| Wrong eligibility numbers in seeds | Human check against myscheme.gov.in before demo; disclaimer on results |
| Scope creep | Strict P0/P1/P2 tiers and cut order (Section 13.2) |

---

## 19. Ethics & safety
- The app gives **preliminary guidance**, not an official decision; this is stated on every result.
- No names, Aadhaar numbers, phone numbers or addresses are asked for. Profile stays in the browser; "Clear my data" on /profile.
- Explanations never promise approval and always reference "based on what you told us".
- Unverified rules are clearly flagged so citizens and helpers know what to double-check.

## 20. Future scope (for the pitch)
WhatsApp and IVR (phone call) versions for feature-phone users; Bhashini for all 22 scheduled languages; OCR and photo-of-notice input; DigiLocker document readiness; CSC helper mode with family profiles; automatic re-compilation when a scheme's official page changes; state scheme packs.
