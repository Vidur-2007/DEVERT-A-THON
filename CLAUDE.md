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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
