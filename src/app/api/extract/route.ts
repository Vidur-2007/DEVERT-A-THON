// PDF/text -> compiled Scheme. See SPEC.md Section 7.2 and 7.4.
export const runtime = 'nodejs';

import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { extractPdfText } from '@/lib/pdf';
import { normalizeDocumentText } from '@/lib/llm/normalizeText';
import { sectionFilter, sectionFilterBudget } from '@/lib/llm/sectionFilter';
import { callLLM, LLMUnavailableError, primaryProvider } from '@/lib/llm/provider';
import { buildExtractionUserPrompt, EXTRACTION_SYSTEM } from '@/lib/llm/prompts';
import { ExtractionResultSchema } from '@/lib/llm/schema';
import { safeJsonParse } from '@/lib/llm/json';
import { sanitizeExtractedScheme } from '@/lib/llm/sanitize';
import { cacheGet, cacheSet } from '@/lib/llm/cache';
import { checkRateLimit, getClientKey } from '@/lib/rateLimit';
import type { Scheme } from '@/lib/types';

const MAX_PDF_BYTES = 4 * 1024 * 1024;
const MAX_TEXT_CHARS = 300_000;
// Hard backstop against pathological request bodies -- well above MAX_TEXT_CHARS, so the
// friendly TOO_LARGE check below (not this) is what a citizen actually sees for a long paste.
const ABSOLUTE_MAX_TEXT_CHARS = 2_000_000;
const SCANNED_PDF_MIN_CHARS = 200;

const requestSchema = z
  .object({
    text: z.string().max(ABSOLUTE_MAX_TEXT_CHARS).optional(),
    fileBase64: z.string().optional(),
    fileName: z.string().max(200).optional(),
    lang: z.enum(['en', 'hi', 'te', 'ta']),
  })
  .refine((v) => Boolean(v.text?.trim()) || Boolean(v.fileBase64), {
    message: 'Provide text or a PDF file.',
  });

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: code, message }, { status });
}

function countTotalRules(scheme: Scheme): number {
  return scheme.eligibility.reduce((sum, g) => sum + g.rules.length, 0) + scheme.exclusions.length;
}

function countVerifiedRules(scheme: Scheme): number {
  const all = [...scheme.eligibility.flatMap((g) => g.rules), ...scheme.exclusions];
  return all.filter((r) => r.verified).length;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export async function POST(request: NextRequest) {
  if (!checkRateLimit(getClientKey(request))) {
    return errorResponse('RATE_LIMITED', 'Too many requests. Please wait a moment and try again.', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('BAD_REQUEST', 'Invalid request body.', 400);
  }

  const parsedBody = requestSchema.safeParse(body);
  if (!parsedBody.success) {
    return errorResponse('BAD_REQUEST', 'Provide text or a PDF file.', 400);
  }
  const { text, fileBase64, fileName } = parsedBody.data;

  const startedAt = Date.now();

  // 1. Get text
  let rawText: string;
  if (fileBase64) {
    let buffer: Buffer;
    try {
      buffer = Buffer.from(fileBase64, 'base64');
    } catch {
      return errorResponse('BAD_REQUEST', 'Could not read the uploaded file.', 400);
    }
    if (buffer.byteLength > MAX_PDF_BYTES) {
      return errorResponse('TOO_LARGE', 'The PDF is larger than 4 MB. Try a smaller file.', 413);
    }
    try {
      rawText = await extractPdfText(new Uint8Array(buffer));
    } catch {
      return errorResponse('BAD_REQUEST', 'Could not read this PDF. Try another file or paste the text.', 400);
    }
    // 2. Guard: scanned PDF (near-zero extractable text)
    if (rawText.trim().length < SCANNED_PDF_MIN_CHARS) {
      return errorResponse(
        'SCANNED_PDF',
        'This looks like a scanned copy. Paste the text or try another file.',
        422,
      );
    }
  } else {
    rawText = text ?? '';
  }

  if (rawText.length > MAX_TEXT_CHARS) {
    return errorResponse('TOO_LARGE', 'This document is too long. Try a shorter excerpt.', 413);
  }

  // 3. Normalise
  const normalizedText = normalizeDocumentText(rawText);
  const originalWords = wordCount(normalizedText);

  // 4. Cache check
  const cacheKey = createHash('sha256').update(normalizedText).digest('hex');
  const cached = cacheGet<Scheme>(cacheKey);
  if (cached) {
    return NextResponse.json({
      scheme: cached,
      stats: {
        originalWords,
        simplifiedWords: wordCount(cached.summary.whatIsIt),
        verifiedRules: countVerifiedRules(cached),
        totalRules: countTotalRules(cached),
        provider: 'cache',
        ms: Date.now() - startedAt,
      },
    });
  }

  // 5. Section filter
  const primary = primaryProvider();
  const filteredText = sectionFilter(normalizedText, sectionFilterBudget(primary));

  // 6. Compile
  const userPrompt = buildExtractionUserPrompt({ title: fileName ?? '', text: filteredText });
  let raw: string;
  try {
    raw = await callLLM({ system: EXTRACTION_SYSTEM, user: userPrompt, json: true, temperature: 0.1 });
  } catch (err) {
    if (err instanceof LLMUnavailableError) {
      return errorResponse(
        'LLM_UNAVAILABLE',
        'We could not reach the reading service. Try again shortly, or pick a library scheme.',
        503,
      );
    }
    return errorResponse('LLM_UNAVAILABLE', 'Something went wrong while reading the document.', 503);
  }

  // 7. Validate (zod), one retry on failure per SPEC 7.1
  let parsed;
  try {
    parsed = await safeJsonParse(raw, ExtractionResultSchema, {
      system: EXTRACTION_SYSTEM,
      user: userPrompt,
      json: true,
      temperature: 0.1,
    });
  } catch {
    return errorResponse(
      'LLM_UNAVAILABLE',
      'We could not make sense of this document. Try another file or paste the text.',
      503,
    );
  }

  if ('error' in parsed) {
    return errorResponse('NOT_A_SCHEME', 'This does not look like a government scheme document.', 422);
  }

  // 8 + 9. Verify quotes, drop invalid-field rules, clamp confidence, unique ids
  const sanitized = sanitizeExtractedScheme(parsed, normalizedText);

  const scheme: Scheme = {
    id: `u-${cacheKey.slice(0, 8)}`,
    ...sanitized,
    source: {
      kind: 'upload',
      title: fileName || sanitized.name,
      extractedAt: new Date().toISOString(),
      wordCount: originalWords,
    },
  };

  cacheSet(cacheKey, scheme);

  // 10. Return
  return NextResponse.json({
    scheme,
    stats: {
      originalWords,
      simplifiedWords: wordCount(scheme.summary.whatIsIt),
      verifiedRules: countVerifiedRules(scheme),
      totalRules: countTotalRules(scheme),
      provider: primary,
      ms: Date.now() - startedAt,
    },
  });
}
