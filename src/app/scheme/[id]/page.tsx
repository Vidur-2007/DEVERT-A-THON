'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Rule, Scheme } from '@/lib/types';
import { useSchemeById } from '@/lib/useSchemeLibrary';
import { useTranslatedScheme } from '@/lib/useTranslatedScheme';
import { useT } from '@/lib/i18n/strings';
import { BenefitCard } from '@/components/BenefitCard';
import { SourceDrawer } from '@/components/SourceDrawer';
import { JargonText } from '@/components/JargonText';
import { ReadabilityStrip } from '@/components/ReadabilityStrip';
import { ApplySteps } from '@/components/ApplySteps';
import { SpeakButton } from '@/components/SpeakButton';

// Looks up the Rule behind a whoCanApply/notFor bullet by matching its plain-language
// *English* label (seed schemes are authored so these labels line up 1:1 with a rule) --
// callers must pass the original English item, not a translated one, since rule.label
// is never translated.
function findRuleForLabel(scheme: Scheme, label: string): Rule | undefined {
  for (const group of scheme.eligibility) {
    const rule = group.rules.find((r) => r.label === label);
    if (rule) return rule;
  }
  return undefined;
}

function findExclusionForLabel(scheme: Scheme, label: string): Rule | undefined {
  return scheme.exclusions.find((r) => r.label === label);
}

// Scheme Explainer. SPEC.md Section 8.2.
export default function SchemeExplainerPage() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const { scheme, checked } = useSchemeById(id);
  const { summary, unavailable: translationFailed } = useTranslatedScheme(scheme);

  if (!scheme) {
    // Not yet checked (could still be an uploaded scheme found in localStorage) -> stay
    // quiet rather than flashing "not found" for a scheme that's about to appear.
    if (!checked) return null;
    return (
      <div className="mx-auto max-w-[720px] px-4 py-10 text-center">
        <p className="text-lg text-ink">{t('schemeNotFound')}</p>
        <Link href="/" className="mt-4 inline-block text-marigold underline">
          {t('backToHome')}
        </Link>
      </div>
    );
  }

  const simplifiedWordCount = summary.whatIsIt.split(/\s+/).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-[720px] px-4 pb-28 pt-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-slate hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" /> {t('backToHome')}
      </Link>

      {/* 1. Header */}
      <header className="mb-5">
        <span className="inline-block rounded-full bg-ink/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate">
          {scheme.level === 'central' ? t('levelCentral') : t('levelState')}
        </span>
        <h1 className="mt-2 text-3xl font-bold text-ink">{scheme.name}</h1>
        {scheme.ministry && <p className="mt-1 text-sm text-slate">{scheme.ministry}</p>}
        {translationFailed && <p className="mt-2 text-xs text-haldi">{t('translationUnavailable')}</p>}
      </header>

      {/* 2. In simple words */}
      <section className="mb-6">
        <p className="text-2xl font-semibold text-ink">{summary.oneLiner}</p>
        <p className="mt-2 text-lg text-ink/90">
          <JargonText text={summary.whatIsIt} jargon={scheme.jargon} />
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ReadabilityStrip originalWordCount={scheme.source.wordCount} simplifiedWordCount={simplifiedWordCount} />
          <SpeakButton text={`${summary.oneLiner} ${summary.whatIsIt}`} />
        </div>
      </section>

      {/* 3. What you get */}
      <section className="mb-6">
        <h2 className="mb-3 text-xl font-semibold text-ink">{t('whatYouGet')}</h2>
        <div className="grid gap-3">
          {summary.benefits.map((benefit, i) => (
            <BenefitCard key={i} benefit={benefit} jargon={scheme.jargon} />
          ))}
        </div>
      </section>

      {/* 4. Who can / cannot apply */}
      <section className="mb-6 grid gap-5 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-leaf">{t('whoCanApply')}</h2>
          <ul className="space-y-2">
            {summary.whoCanApply.map((item, i) => {
              const rule = findRuleForLabel(scheme, scheme.summary.whoCanApply[i] ?? item);
              return (
                <li
                  key={i}
                  className="flex items-start justify-between gap-2 rounded-lg bg-leaf/5 p-3 text-base text-ink"
                >
                  <span>{item}</span>
                  {rule && <SourceDrawer label={item} sourceQuote={rule.sourceQuote} verified={rule.verified} />}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-semibold text-sindoor">{t('whoCannotApply')}</h2>
          <ul className="space-y-2">
            {summary.notFor.map((item, i) => {
              const rule = findExclusionForLabel(scheme, scheme.summary.notFor[i] ?? item);
              return (
                <li
                  key={i}
                  className="flex items-start justify-between gap-2 rounded-lg bg-sindoor/5 p-3 text-base text-ink"
                >
                  <span>{item}</span>
                  {rule && <SourceDrawer label={item} sourceQuote={rule.sourceQuote} verified={rule.verified} />}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 5. Papers you need (preview) */}
      <section className="mb-6">
        <h2 className="mb-3 text-xl font-semibold text-ink">{t('papersYouNeed')}</h2>
        <ul className="space-y-2">
          {summary.documents.map((doc, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3 text-base text-ink"
            >
              <span>
                <JargonText text={doc.name} jargon={scheme.jargon} />
              </span>
              {doc.mandatory && <span className="text-xs font-medium text-sindoor">{t('mandatory')}</span>}
            </li>
          ))}
        </ul>
      </section>

      {/* 6. How to apply */}
      <section className="mb-6">
        <h2 className="mb-3 text-xl font-semibold text-ink">{t('howToApply')}</h2>
        <ApplySteps
          steps={summary.howToApply}
          jargon={scheme.jargon}
          officialUrl={summary.officialUrl}
          helpline={summary.helpline}
        />
      </section>

      {/* 7. Not clear in the document */}
      {scheme.documentGaps.length > 0 && (
        <section className="mb-6 rounded-xl bg-haldi-bg p-4">
          <h2 className="mb-2 text-base font-semibold text-haldi">{t('notClearInDocument')}</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink/80">
            {scheme.documentGaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 8. Sticky bottom CTA */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-[720px]">
          <Link
            href={`/scheme/${scheme.id}/check`}
            className="flex min-h-[56px] items-center justify-center rounded-full bg-ink text-lg font-semibold text-paper focus-visible:outline-none"
          >
            {t('checkIfICanApply')}
          </Link>
        </div>
      </div>
    </div>
  );
}
