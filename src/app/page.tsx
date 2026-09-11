'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListChecks, Sparkles, Upload } from 'lucide-react';
import { SCHEMES } from '@/data/schemes';
import { getUploadedSchemes } from '@/lib/storage';
import type { Scheme } from '@/lib/types';
import { useT } from '@/lib/i18n/strings';

// Landing page. SPEC.md Section 9.6: the hero *is* the product -- a big prompt,
// three big actions, and a strip of library schemes below. No stats banner.
export default function LandingPage() {
  const t = useT();
  const [uploadedSchemes, setUploadedSchemes] = useState<Scheme[]>([]);

  // Uploaded schemes only exist in this browser's localStorage, so they're added
  // after mount -- same pattern as everywhere else localStorage-backed content appears.
  useEffect(() => {
    const uploaded = getUploadedSchemes();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage read after mount
    if (uploaded.length > 0) setUploadedSchemes(uploaded);
  }, []);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10">
      <h1 className="text-center text-3xl font-bold text-ink sm:text-4xl">{t('heroPrompt')}</h1>
      <p className="mt-3 text-center text-lg text-slate">{t('tagline')}</p>

      <div className="mt-8 grid gap-4">
        <Link
          href="/upload"
          className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm transition hover:border-marigold focus-visible:outline-none"
        >
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-marigold/15 text-marigold">
            <Upload aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold text-ink">{t('uploadActionTitle')}</span>
            <span className="block text-sm text-slate">{t('uploadActionDesc')}</span>
          </span>
        </Link>

        <a
          href="#library"
          className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm transition hover:border-marigold focus-visible:outline-none"
        >
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-leaf/15 text-leaf">
            <ListChecks aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold text-ink">{t('pickActionTitle')}</span>
            <span className="block text-sm text-slate">{t('pickActionDesc')}</span>
          </span>
        </a>

        <Link
          href="/discover"
          className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm transition hover:border-marigold focus-visible:outline-none"
        >
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-ink/10 text-ink">
            <Sparkles aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold text-ink">{t('discoverActionTitle')}</span>
            <span className="block text-sm text-slate">{t('discoverActionDesc')}</span>
          </span>
        </Link>
      </div>

      {uploadedSchemes.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-ink">{t('yourUploadedSchemes')}</h2>
          <div className="flex flex-wrap gap-2">
            {uploadedSchemes.map((scheme) => (
              <Link
                key={scheme.id}
                href={`/scheme/${scheme.id}`}
                className="flex min-h-[48px] items-center rounded-full border border-ink/15 bg-white px-4 py-2 text-base text-ink transition hover:border-marigold hover:text-marigold focus-visible:outline-none"
              >
                {scheme.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="library" className="mt-12 scroll-mt-6">
        <h2 className="mb-4 text-xl font-semibold text-ink">{t('libraryHeading')}</h2>
        <div className="flex flex-wrap gap-2">
          {SCHEMES.map((scheme) => (
            <Link
              key={scheme.id}
              href={`/scheme/${scheme.id}`}
              className="flex min-h-[48px] items-center rounded-full border border-ink/15 bg-white px-4 py-2 text-base text-ink transition hover:border-marigold hover:text-marigold focus-visible:outline-none"
            >
              {scheme.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
