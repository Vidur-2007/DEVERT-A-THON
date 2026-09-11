// Checks a rule's sourceQuote really appears in the document. See SPEC.md Section 7.2 step 8.
// This is the app's core defence against LLM hallucination: the engine never trusts a
// quote it can't verify -- it just shows a "Check manually" badge instead.

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordFiveGrams(words: string[]): string[] {
  const grams: string[] = [];
  for (let i = 0; i + 5 <= words.length; i++) {
    grams.push(words.slice(i, i + 5).join(' '));
  }
  return grams;
}

/** verified = exact substring match, OR >= 80% of the quote's word 5-grams found in the text. */
export function verifyQuote(quote: string, documentText: string): boolean {
  const normQuote = normalize(quote);
  const normDoc = normalize(documentText);
  if (!normQuote) return false;
  if (normDoc.includes(normQuote)) return true;

  const quoteWords = normQuote.split(' ');
  if (quoteWords.length < 5) return false; // too short for a 5-gram check

  const grams = wordFiveGrams(quoteWords);
  if (grams.length === 0) return false;
  const found = grams.filter((g) => normDoc.includes(g)).length;
  return found / grams.length >= 0.8;
}
