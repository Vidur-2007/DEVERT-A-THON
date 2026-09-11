// Matches a spoken transcript to a question's answer. See SPEC.md Section 10:
// yes/no synonyms across languages, fuzzy option matching (Levenshtein <= 2), and
// number words ("lakh/लाख/లక్ష/லட்சம்", "hazaar/हज़ार"). Pure logic, no browser APIs,
// so it's unit-testable on its own.

export interface MatchOption {
  value: string;
  label: string;
}

export type MatchedAnswer =
  | { matched: true; value: boolean | string | number }
  | { matched: false };

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// A citizen may code-switch, so we match "haan/avunu/aamaa" style synonyms across all
// four languages regardless of the UI's current language (SPEC Section 8.3).
const YES_WORDS = [
  'yes', 'yeah', 'yep', 'ya', 'sure', 'correct',
  'haan', 'han', 'हां', 'हाँ', 'ji haan', 'जी हां',
  'avunu', 'అవును',
  'aamaa', 'aam', 'ஆம்',
];
const NO_WORDS = [
  'no', 'nope', 'nah', 'not',
  'nahi', 'nahin', 'नहीं',
  'ledu', 'లేదు',
  'illai', 'இல்லை',
];

export function matchYesNo(transcript: string): boolean | null {
  const norm = ` ${normalize(transcript)} `;
  const hasYes = YES_WORDS.some((w) => norm.includes(` ${normalize(w)} `));
  const hasNo = NO_WORDS.some((w) => norm.includes(` ${normalize(w)} `));
  if (hasYes && !hasNo) return true;
  if (hasNo && !hasYes) return false;
  return null;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function matchOption(transcript: string, options: MatchOption[]): string | null {
  const norm = normalize(transcript);
  if (!norm) return null;

  // Exact or substring match first.
  for (const opt of options) {
    const label = normalize(opt.label);
    if (label && (norm === label || norm.includes(label) || label.includes(norm))) return opt.value;
  }

  // Fuzzy fallback: closest label within edit distance 2.
  let best: { value: string; dist: number } | null = null;
  for (const opt of options) {
    const dist = levenshtein(norm, normalize(opt.label));
    if (dist <= 2 && (!best || dist < best.dist)) best = { value: opt.value, dist };
  }
  return best?.value ?? null;
}

const DEVANAGARI_DIGITS = '०१२३४५६७८९';
const TELUGU_DIGITS = '౦౧౨౩౪౫౬౭౮౯';
const TAMIL_DIGITS = '௦௧௨௩௪௫௬௭௮௯';

function toWesternDigits(s: string): string {
  return s.replace(/[०-९౦-౯௦-௯]/g, (ch) => {
    for (const script of [DEVANAGARI_DIGITS, TELUGU_DIGITS, TAMIL_DIGITS]) {
      const idx = script.indexOf(ch);
      if (idx !== -1) return String(idx);
    }
    return ch;
  });
}

const LAKH_WORDS = ['lakh', 'lakhs', 'lac', 'लाख', 'లక్ష', 'లక్షలు', 'லட்சம்', 'லட்சங்கள்'];
const CRORE_WORDS = ['crore', 'crores', 'करोड़', 'కోటి', 'கோடி'];
const THOUSAND_WORDS = ['hazaar', 'hazar', 'thousand', 'हज़ार', 'हजार', 'వెయ్యి', 'ஆயிரம்'];

function findMultiplier(text: string, words: string[]): number {
  return words.some((w) => text.includes(w)) ? 1 : 0;
}

/** Parses a spoken number, including "2 lakh" / "२ लाख" / "2 లక్షలు" / "2 லட்சம்" style amounts. */
export function parseSpokenNumber(transcript: string): number | null {
  const text = toWesternDigits(transcript.toLowerCase());
  const numberMatch = text.match(/\d+(\.\d+)?/);
  if (!numberMatch) return null;
  const base = parseFloat(numberMatch[0]);
  if (Number.isNaN(base)) return null;

  if (findMultiplier(text, CRORE_WORDS)) return Math.round(base * 10000000);
  if (findMultiplier(text, LAKH_WORDS)) return Math.round(base * 100000);
  if (findMultiplier(text, THOUSAND_WORDS)) return Math.round(base * 1000);
  return Math.round(base);
}

/**
 * Matches a spoken transcript against a question of the given shape. `options` (for
 * `enum`) should already be localized to the citizen's current language.
 */
export function matchSpokenAnswer(
  transcript: string,
  type: 'boolean' | 'enum' | 'number',
  options?: MatchOption[],
): MatchedAnswer {
  if (!transcript.trim()) return { matched: false };

  if (type === 'boolean') {
    const value = matchYesNo(transcript);
    return value === null ? { matched: false } : { matched: true, value };
  }

  if (type === 'enum') {
    const value = matchOption(transcript, options ?? []);
    return value === null ? { matched: false } : { matched: true, value };
  }

  const value = parseSpokenNumber(transcript);
  return value === null ? { matched: false } : { matched: true, value };
}
