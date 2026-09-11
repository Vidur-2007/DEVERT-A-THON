# Yojana Saathi

**"Other tools summarise documents. Yojana Saathi turns a government PDF into executable, cited rules and gives every citizen an explainable eligibility decision in their own language in under a minute."**

Yojana Saathi **compiles** a government scheme document (a PM-KISAN-style PDF, or plain text) into a machine-readable rulebook — eligibility rules, exclusions, benefits, documents, and application steps — with every rule linked to the exact sentence it came from. A **deterministic rules engine** (never the LLM) then evaluates the citizen's profile against those rules using three-valued logic (Pass / Fail / Unknown), asking only the questions it still needs, in the citizen's own language, by voice or tap. The result is a verdict with per-criterion reasons, verified source quotes, a document checklist, application steps, near-miss hints ("you'd qualify if your income were below ₹2.5 lakh"), and alternative schemes the same profile already qualifies for.

**Core principle: *The AI reads. The rules decide. The citizen sees why.***

Built for a hackathon against [`SPEC.md`](SPEC.md), which is the full source of truth for architecture, the rules engine DSL, the LLM layer, UI/UX system, and acceptance criteria.

## Live demo

**[devert-a-thon.vercel.app](https://devert-a-thon.vercel.app/)**

## How it works

1. **Upload or pick a scheme.** Upload a PDF/pasted document, or choose one of 8 pre-compiled central schemes.
2. **Explainer.** The document is simplified into plain language, with a readability strip ("1,800 words → 52 words") and every claim linked to a verbatim quote from the source, auto-verified against the original text (✓ Verified / ⚠ Check manually).
3. **Check.** A short wizard (3–6 taps, ≤7 questions) asks only the most decisive unanswered questions first, in English/Hindi/Telugu/Tamil, by tap or voice.
4. **Result.** A verdict stamp (Eligible / Not eligible / Likely eligible / Need more info) with a rule-by-rule breakdown, a document checklist, application steps, and — if the citizen doesn't qualify — a ranked list of other schemes they do.

## Stack

Next.js (App Router) + TypeScript (strict) + Tailwind CSS v4 + Zod + Vitest. The rules engine (`src/lib/engine`) is pure TypeScript with no React, fetch, or LLM dependency, fully unit-tested. LLM calls happen only in `src/app/api/*` routes via `src/lib/llm/provider.ts`, and every LLM response is Zod-validated with a non-LLM fallback path — the client never calls an LLM directly.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in keys, or just set DEMO_MODE=true
npm run dev                        # http://localhost:3000
```

Before shipping any change: `npm run lint && npm run test && npm run build` must pass.

### Environment variables

All in `.env.local` (see `.env.local.example`):

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Free key from [aistudio.google.com](https://aistudio.google.com) — primary LLM provider |
| `GEMINI_MODEL` | Model name — `gemini-flash-lite-latest` is fast and reliable; `gemini-flash-latest` also works but is much slower (25-45s/call) and prone to "high demand" 503s on the free tier |
| `GROQ_API_KEY` | Free key from [console.groq.com](https://console.groq.com) — optional fallback provider |
| `GROQ_MODEL` | Model name, e.g. `llama-3.3-70b-versatile` |
| `LLM_PRIMARY` | `gemini` or `groq` — which provider to try first |
| `DEMO_MODE` | `true` = never call an LLM; use pre-compiled seeds + templates only |

No names, phone numbers, Aadhaar numbers, or other PII are ever sent to any API — the citizen's profile lives only in the browser.

## Running in demo mode (no API keys needed)

The 8 seed schemes ship pre-compiled with verified source quotes, so the core flow — browse a scheme, run the eligibility check, see a cited verdict and alternatives — works completely offline from the LLM, with zero API keys:

```bash
echo "DEMO_MODE=true" > .env.local
npm run build
npm start          # production server on http://localhost:3000
```

With `DEMO_MODE=true`, any flow that *requires* reading a new document live (the `/upload` page's PDF/paste/sample extraction) will show the "reading service unavailable" state with a link back to the seed library, rather than fail silently — that's the expected, graceful degradation, not a bug. Everything else — landing, explainer, check, result, alternatives, language switching, voice, print/share — works end to end with no keys configured.

## Demo script (3 minutes)

From SPEC.md Section 16 — the intended live-demo flow:

1. **Hook (20s):** Hold up the printed PM-KISAN guidelines. *"This is how the government explains a ₹6,000 benefit. Lakshmi, an agricultural labourer, would have to read all of this to learn it isn't for her — and never learn what **is**."*
2. **Upload (40s):** Upload the PDF live. Loading stages narrate the pipeline. Show the explainer in simple words, the readability strip (e.g. "45 min → 1 min"), and open one source quote with ✓ Verified.
3. **Check, in Hindi, by voice (50s):** Switch to हिन्दी. Speak Lakshmi's one-line intro. Profile chips appear. Answer one question by voice. Watch the criteria panel flip ✓ ✗.
4. **Verdict (30s):** The stamp lands: *Not eligible* — "Only families that own farm land can apply", with the exact clause. Point out: *the AI read it; the rules decided; here's why.*
5. **Turn a no into a yes (30s):** Alternatives: Ujjwala (free LPG), Sukanya Samriddhi for her daughter, PMSBY accident cover — each with reasons, documents checklist, and "Share on WhatsApp".
6. **Close (10s):** *"Explainable, cited, multilingual eligibility — built on free tools, ready for every CSC in India."*

**Backup:** if the network or API fails mid-demo, switch to the pre-compiled PM-KISAN seed (`DEMO_MODE=true`, identical flow) — never debug on stage.

## Seed schemes

PM-KISAN, Atal Pension Yojana, PM Jeevan Jyoti Bima Yojana, PM Suraksha Bima Yojana, Sukanya Samriddhi Yojana, PM Ujjwala Yojana, Ayushman Bharat PM-JAY, PM SVANidhi — see SPEC.md Section 12 for the full rule mapping and Section 12.1 for the persona test fixtures (Lakshmi, Ramesh, a retired officer, Farhan) used throughout the test suite.

## Disclaimer

Yojana Saathi gives **preliminary guidance**, not an official eligibility decision — this is stated on every result. No names, Aadhaar numbers, phone numbers, or addresses are ever collected; the profile stays in the browser only. Unverified rules are clearly flagged so citizens and helpers know what to double-check against the official source.
