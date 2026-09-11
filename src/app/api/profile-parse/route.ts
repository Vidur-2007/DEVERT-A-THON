// Free-text ("Tell us about yourself in one line") -> partial CitizenProfile. SPEC.md Section 7.3/7.4.
export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { callLLM, LLMUnavailableError } from '@/lib/llm/provider';
import { buildProfileParseSystem, buildProfileParseUserPrompt } from '@/lib/llm/prompts';
import { ProfileParseResultSchema } from '@/lib/llm/schema';
import { safeJsonParse } from '@/lib/llm/json';
import { checkRateLimit, getClientKey } from '@/lib/rateLimit';

const requestSchema = z.object({
  text: z.string().min(1).max(1000),
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
    return NextResponse.json({ error: 'BAD_REQUEST', message: 'Tell us a little about yourself first.' }, { status: 400 });
  }

  const system = buildProfileParseSystem();
  const user = buildProfileParseUserPrompt(parsed.data.text);

  let raw: string;
  try {
    raw = await callLLM({ system, user, json: true, temperature: 0.1 });
  } catch (err) {
    if (err instanceof LLMUnavailableError) {
      // SPEC 7.4 fallback: "Skip to wizard" -- an empty profile lets the wizard take over.
      return NextResponse.json({ profile: {}, unclear: [] });
    }
    return NextResponse.json({ profile: {}, unclear: [] });
  }

  try {
    const result = await safeJsonParse(raw, ProfileParseResultSchema, { system, user, json: true, temperature: 0.1 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ profile: {}, unclear: [] });
  }
}
