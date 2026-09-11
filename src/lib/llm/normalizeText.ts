// Collapses whitespace and drops repeated page headers/footers. See SPEC.md Section 7.2 step 3.

export function normalizeDocumentText(raw: string): string {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');

  const counts = new Map<string, number>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 4) continue; // ignore near-empty lines when spotting repeats
    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }
  const repeated = new Set([...counts.entries()].filter(([, count]) => count >= 3).map(([line]) => line));

  const withoutHeadersFooters = lines.filter((line) => !repeated.has(line.trim())).join('\n');

  return withoutHeadersFooters
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
