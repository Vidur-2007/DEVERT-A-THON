// Server-only PDF text extraction. See SPEC.md Section 5.3 ("unpdf (server), text PDFs").
import { extractText, getDocumentProxy } from 'unpdf';

export async function extractPdfText(data: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}
