// Scheme display strings -> target language, cached. See SPEC.md Section 7.3/7.4/7.5.
export const runtime = 'nodejs';

import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { callLLM, LLMUnavailableError } from '@/lib/llm/provider';
import { buildTranslateSystem, buildTranslateUserPrompt } from '@/lib/llm/prompts';
import { TranslatableContentSchema } from '@/lib/llm/schema';
import { safeJsonParse } from '@/lib/llm/json';
import { cacheGet, cacheSet } from '@/lib/llm/cache';
import { checkRateLimit, getClientKey } from '@/lib/rateLimit';

const requestSchema = z.object({
  schemeId: z.string().min(1).max(100),
  payload: TranslatableContentSchema,
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
  const { schemeId, payload, lang } = parsed.data;

  // English is the canonical language -- nothing to translate.
  if (lang === 'en') {
    return NextResponse.json({ payload, source: 'llm' as const });
  }

  const fallback = () => NextResponse.json({ payload, source: 'fallback' as const });

  const cacheKey = `${schemeId}:${lang}:${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`;
  const cached = cacheGet<typeof payload>(cacheKey);
  if (cached) {
    return NextResponse.json({ payload: cached, source: 'llm' as const });
  }

  const system = buildTranslateSystem(lang);
  const user = buildTranslateUserPrompt(payload);

  let raw: string;
  try {
    raw = await callLLM({ system, user, json: true, temperature: 0.2, maxTokens: 3000 });
  } catch (err) {
    if (err instanceof LLMUnavailableError) return fallback();
    return fallback();
  }

  try {
    const translated = await safeJsonParse(raw, TranslatableContentSchema, {
      system,
      user,
      json: true,
      temperature: 0.2,
    });
    cacheSet(cacheKey, translated);
    return NextResponse.json({ payload: translated, source: 'llm' as const });
  } catch {
    return fallback();
  }
}
