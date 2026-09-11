// Personalised explanation of an eligibility result. See SPEC.md Section 7.3/7.4.
// The LLM only writes the sentence; the verdict itself was already decided by the engine.
export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { callLLM, LLMUnavailableError } from '@/lib/llm/provider';
import { buildExplainSystem, buildExplainUserPrompt } from '@/lib/llm/prompts';
import { ExplainResultSchema } from '@/lib/llm/schema';
import { safeJsonParse } from '@/lib/llm/json';
import { buildTemplateExplanation } from '@/lib/explainTemplate';
import { cacheGet, cacheSet } from '@/lib/llm/cache';
import { checkRateLimit, getClientKey } from '@/lib/rateLimit';
import { createHash } from 'node:crypto';

const payloadSchema = z.object({
  schemeName: z.string().min(1).max(200),
  verdict: z.string().min(1).max(40),
  passed: z.array(z.string().max(300)).max(20),
  failed: z.array(z.object({ label: z.string().max(300), nearMiss: z.string().max(300).optional() })).max(20),
  unknown: z.array(z.string().max(300)).max(20),
  documentGaps: z.array(z.string().max(300)).max(20),
  topAlternatives: z.array(z.string().max(200)).max(5),
});

const requestSchema = z.object({
  summaryPayload: payloadSchema,
  lang: z.enum(['en', 'hi', 'te', 'ta']),
});

export async function POST(request: NextRequest) {
  if (!checkRateLimit(getClientKey(request))) {
    return NextResponse.json({ error: 'RATE_LIMITED', message: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'BAD_REQUEST', message: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'BAD_REQUEST', message: 'Invalid request.' }, { status: 400 });
  }
  const { summaryPayload, lang } = parsed.data;

  const template = () =>
    NextResponse.json({ explanation: buildTemplateExplanation(summaryPayload, lang), source: 'template' as const });

  const cacheKey = createHash('sha256').update(JSON.stringify(summaryPayload)).update(lang).digest('hex');
  const cached = cacheGet<string>(cacheKey);
  if (cached) {
    return NextResponse.json({ explanation: cached, source: 'llm' as const });
  }

  const system = buildExplainSystem(lang);
  const user = buildExplainUserPrompt(summaryPayload);

  let raw: string;
  try {
    raw = await callLLM({ system, user, json: true, temperature: 0.4, maxTokens: 400 });
  } catch (err) {
    if (err instanceof LLMUnavailableError) return template();
    return template();
  }

  try {
    const result = await safeJsonParse(raw, ExplainResultSchema, { system, user, json: true, temperature: 0.4 });
    cacheSet(cacheKey, result.explanation);
    return NextResponse.json({ explanation: result.explanation, source: 'llm' as const });
  } catch {
    return template();
  }
}
