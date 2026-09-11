// Trims long documents down to the paragraphs most likely to matter, keeping them in
// original order. See SPEC.md Section 7.2 step 5.

const KEYWORDS = [
  'eligib',
  'criteria',
  'benefit',
  'assistance',
  'amount',
  '₹',
  'rs',
  'document',
  'apply',
  'application',
  'exclusion',
  'not eligible',
  'income',
  'age',
  'years',
  'bpl',
  'land',
  'family',
  'beneficiary',
  'procedure',
];

/** Gemini gets a bigger budget than Groq (SPEC 7.2 step 5's 60,000 / 18,000 char split). */
export function sectionFilterBudget(primary: 'gemini' | 'groq'): number {
  return primary === 'groq' ? 18_000 : 60_000;
}

function score(paragraph: string): number {
  const lower = paragraph.toLowerCase();
  return KEYWORDS.reduce((count, kw) => (lower.includes(kw) ? count + 1 : count), 0);
}

/** Returns `text` unchanged if it already fits `budgetChars`; otherwise keeps the
 * highest-scoring paragraphs (by keyword hits), restored to their original order. */
export function sectionFilter(text: string, budgetChars: number): string {
  if (text.length <= budgetChars) return text;

  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const scored = paragraphs.map((p, index) => ({ index, text: p, score: score(p) }));
  scored.sort((a, b) => b.score - a.score);

  const selected: typeof scored = [];
  let used = 0;
  for (const item of scored) {
    if (used >= budgetChars) break;
    selected.push(item);
    used += item.text.length + 2; // +2 for the paragraph break we'll rejoin with
  }

  selected.sort((a, b) => a.index - b.index);
  return selected.map((s) => s.text).join('\n\n');
}
