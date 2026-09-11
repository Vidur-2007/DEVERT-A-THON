'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, FileText, Upload } from 'lucide-react';
import { useLang } from '@/lib/i18n/useLang';
import { useT, useTf } from '@/lib/i18n/strings';
import { saveUploadedScheme } from '@/lib/storage';
import type { Scheme } from '@/lib/types';
import { LoadingStages } from '@/components/LoadingStages';
import { ReadabilityStrip } from '@/components/ReadabilityStrip';

const MAX_PDF_BYTES = 4 * 1024 * 1024;

interface ExtractStats {
  originalWords: number;
  simplifiedWords: number;
  verifiedRules: number;
  totalRules: number;
}

interface ExtractError {
  code: string;
  message: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read file'));
        return;
      }
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

// Upload a scheme document: PDF, pasted text, or a sample. SPEC.md Section 8.1 (/upload)
// and 8.6 (loading stages, scanned PDF, not a scheme, LLM unavailable).
export default function UploadPage() {
  const { lang } = useLang();
  const t = useT();
  const tf = useTf();

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<ExtractError | null>(null);
  const [result, setResult] = useState<{ scheme: Scheme; stats: ExtractStats } | null>(null);

  async function runExtraction(payload: { text?: string; fileBase64?: string; fileName?: string }) {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ code: typeof data?.error === 'string' ? data.error : 'UNKNOWN', message: data?.message || t('genericError') });
        setStatus('error');
        return;
      }
      saveUploadedScheme(data.scheme as Scheme);
      setResult({ scheme: data.scheme as Scheme, stats: data.stats as ExtractStats });
      setStatus('done');
    } catch {
      setError({ code: 'NETWORK', message: t('networkError') });
      setStatus('error');
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after an error
    if (!file) return;
    if (file.size > MAX_PDF_BYTES) {
      setError({ code: 'TOO_LARGE', message: t('pdfSizeLimit') });
      setStatus('error');
      return;
    }
    try {
      const fileBase64 = await fileToBase64(file);
      await runExtraction({ fileBase64, fileName: file.name });
    } catch {
      setError({ code: 'BAD_REQUEST', message: t('genericError') });
      setStatus('error');
    }
  }

  function handlePasteSubmit() {
    if (!pastedText.trim()) return;
    runExtraction({ text: pastedText });
  }

  async function handleTrySample() {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/samples/pm-kisan-sample.txt');
      const text = await res.text();
      await runExtraction({ text, fileName: 'PM-KISAN Sample Guidelines' });
    } catch {
      setError({ code: 'NETWORK', message: t('networkError') });
      setStatus('error');
    }
  }

  if (status === 'loading') {
    return <LoadingStages />;
  }

  if (status === 'done' && result) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto text-leaf" size={48} aria-hidden="true" />
        <h1 className="mt-3 text-xl font-semibold text-ink">{t('extractionDoneTitle')}</h1>
        <p className="mt-2 text-base text-slate">
          {tf('extractionStats', { verified: result.stats.verifiedRules, total: result.stats.totalRules })}
        </p>
        <div className="mt-4 flex justify-center">
          <ReadabilityStrip
            originalWordCount={result.stats.originalWords}
            simplifiedWordCount={result.stats.simplifiedWords}
          />
        </div>
        <Link
          href={`/scheme/${result.scheme.id}`}
          className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-full bg-ink px-6 text-lg font-semibold text-paper focus-visible:outline-none"
        >
          {t('seeSimplifiedVersion')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[560px] px-4 py-8">
      <h1 className="text-3xl font-bold text-ink">{t('uploadActionTitle')}</h1>
      <p className="mt-2 text-base text-slate">{t('uploadPageSubtitle')}</p>

      {error && (
        <div className="mt-6 rounded-xl border border-sindoor/20 bg-sindoor/5 p-4">
          <p className="flex items-start gap-2 text-base text-ink">
            <AlertTriangle className="mt-0.5 flex-none text-sindoor" size={20} aria-hidden="true" />
            {error.message}
          </p>
          {(error.code === 'LLM_UNAVAILABLE' || error.code === 'NOT_A_SCHEME') && (
            <Link href="/#library" className="mt-3 inline-block text-marigold underline">
              {t('browseLibraryInstead')}
            </Link>
          )}
          {error.code === 'SCANNED_PDF' && (
            <p className="mt-2 text-sm text-slate">{t('pasteTextPlaceholder')}</p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <label className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 bg-white p-6 text-center transition hover:border-marigold">
          <Upload className="text-marigold" size={28} aria-hidden="true" />
          <span className="text-base font-semibold text-ink">{t('choosePdfFile')}</span>
          <span className="text-sm text-slate">{t('pdfSizeLimit')}</span>
          <input type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
        </label>

        <div className="flex items-center gap-3 text-sm text-slate">
          <span className="h-px flex-1 bg-ink/10" />
          {t('or')}
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <div>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={t('pasteTextPlaceholder')}
            rows={8}
            className="w-full rounded-2xl border border-ink/15 bg-white p-4 text-base text-ink focus-visible:outline-none focus-visible:border-marigold"
          />
          <button
            type="button"
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim()}
            className="mt-2 flex min-h-[56px] w-full items-center justify-center rounded-full bg-ink px-4 text-lg font-semibold text-paper disabled:opacity-40"
          >
            {t('extractFromText')}
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate">
          <span className="h-px flex-1 bg-ink/10" />
          {t('or')}
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <button
          type="button"
          onClick={handleTrySample}
          className="flex min-h-[56px] items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-base font-medium text-ink transition hover:border-marigold hover:text-marigold focus-visible:outline-none"
        >
          <FileText size={18} aria-hidden="true" /> {t('trySample')}
        </button>
      </div>
    </div>
  );
}
