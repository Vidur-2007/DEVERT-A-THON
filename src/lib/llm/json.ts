// Turns a raw LLM text response into a validated object. See SPEC.md Section 7.1.

import type { ZodType } from 'zod';
import { callLLM, type LLMRequest } from './provider';

/** Strips ```json fences (if any) and slices from the first { to the last }. */
export function extractJsonPayload(raw: string): string {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}

/**
 * Parses + zod-validates `raw`. On failure, if `retryRequest` is given, asks the model
 * once more with the zod error appended ("Fix these errors and return only JSON"),
 * per SPEC 7.1. Throws if that retry also fails.
 */
export async function safeJsonParse<T>(raw: string, schema: ZodType<T>, retryRequest?: LLMRequest): Promise<T> {
  const attempt = (payload: string): T => schema.parse(JSON.parse(extractJsonPayload(payload)));

  try {
    return attempt(raw);
  } catch (firstError) {
    if (!retryRequest) throw firstError;
    const errorText = firstError instanceof Error ? firstError.message : String(firstError);
    const retryUser = `${retryRequest.user}\n\nYour previous answer was invalid JSON for this schema:\n${errorText}\nFix these errors and return only JSON.`;
    const retryRaw = await callLLM({ ...retryRequest, user: retryUser });
    return attempt(retryRaw);
  }
}
