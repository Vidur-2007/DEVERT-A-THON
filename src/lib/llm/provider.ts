// LLM provider abstraction: Gemini primary, Groq fallback, plain fetch (no SDKs).
// See SPEC.md Section 7.1. Server-only -- CLAUDE.md: "Never call LLMs from the client."

export interface LLMRequest {
  system: string;
  user: string;
  json: boolean;
  maxTokens?: number;
  temperature?: number;
}

export class LLMUnavailableError extends Error {
  constructor(message = 'LLM providers are unavailable') {
    super(message);
    this.name = 'LLMUnavailableError';
  }
}

class HttpStatusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpStatusError';
    this.status = status;
  }
}

type Provider = 'gemini' | 'groq';

const BACKOFF_MS = [1000, 2000, 4000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function callGemini(req: LLMRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const body = {
    systemInstruction: { parts: [{ text: req.system }] },
    contents: [{ role: 'user', parts: [{ text: req.user }] }],
    generationConfig: {
      temperature: req.temperature ?? 0.1,
      maxOutputTokens: req.maxTokens ?? 4096,
      ...(req.json ? { responseMimeType: 'application/json' } : {}),
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  );

  if (!res.ok) throw new HttpStatusError(`Gemini error ${res.status}`, res.status);

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') throw new Error('Gemini returned no text');
  return text;
}

interface GroqResponse {
  choices?: { message?: { content?: string } }[];
}

async function callGroq(req: LLMRequest): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const body = {
    model,
    messages: [
      { role: 'system', content: req.system },
      { role: 'user', content: req.user },
    ],
    temperature: req.temperature ?? 0.1,
    max_tokens: req.maxTokens ?? 4096,
    ...(req.json ? { response_format: { type: 'json_object' } } : {}),
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new HttpStatusError(`Groq error ${res.status}`, res.status);

  const data = (await res.json()) as GroqResponse;
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== 'string') throw new Error('Groq returned no text');
  return text;
}

const CALLERS: Record<Provider, (req: LLMRequest) => Promise<string>> = {
  gemini: callGemini,
  groq: callGroq,
};

function isRetryable(err: unknown): boolean {
  return err instanceof HttpStatusError && (err.status === 429 || err.status >= 500);
}

function hasCredentials(provider: Provider): boolean {
  return provider === 'gemini' ? Boolean(process.env.GEMINI_API_KEY) : Boolean(process.env.GROQ_API_KEY);
}

async function callWithRetry(provider: Provider, req: LLMRequest): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    try {
      return await CALLERS[provider](req);
    } catch (err) {
      lastErr = err;
      if (attempt < BACKOFF_MS.length && isRetryable(err)) {
        await sleep(BACKOFF_MS[attempt]);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

/**
 * Calls the primary LLM provider, retrying 429/5xx with backoff, then falls back to
 * the other configured provider, then throws LLMUnavailableError. If DEMO_MODE=true
 * it never calls out at all -- callers are expected to use their non-LLM fallback.
 */
export async function callLLM(req: LLMRequest): Promise<string> {
  if (process.env.DEMO_MODE === 'true') {
    throw new LLMUnavailableError('DEMO_MODE is enabled');
  }

  const primary: Provider = process.env.LLM_PRIMARY === 'groq' ? 'groq' : 'gemini';
  const fallback: Provider = primary === 'gemini' ? 'groq' : 'gemini';
  const order = [primary, fallback].filter(hasCredentials);

  if (order.length === 0) {
    throw new LLMUnavailableError('No LLM provider is configured');
  }

  let lastErr: unknown;
  for (const provider of order) {
    try {
      return await callWithRetry(provider, req);
    } catch (err) {
      lastErr = err;
    }
  }
  throw new LLMUnavailableError(lastErr instanceof Error ? lastErr.message : 'All LLM providers failed');
}

/** Which provider callLLM would try first, right now -- used for stats/telemetry only. */
export function primaryProvider(): Provider {
  return process.env.LLM_PRIMARY === 'groq' ? 'groq' : 'gemini';
}
