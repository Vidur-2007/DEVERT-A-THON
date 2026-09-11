'use client';

import { useState } from 'react';
import type { CitizenProfile } from '@/lib/types';
import { useLang } from '@/lib/i18n/useLang';
import { useT } from '@/lib/i18n/strings';
import { useSpeechInput } from '@/lib/speech/useSpeechInput';
import { MicButton } from './MicButton';

interface OneLineProfileBoxProps {
  onParsed: (profile: Partial<CitizenProfile>) => void;
  onSkip: () => void;
}

// "Tell us about yourself in one line" -- the optional first screen of the wizard.
// SPEC.md Section 8.3. Uses /api/profile-parse; on any failure that route already
// degrades to an empty profile, so the wizard just takes over (SPEC 7.4 fallback).
export function OneLineProfileBox({ onParsed, onSkip }: OneLineProfileBoxProps) {
  const { lang } = useLang();
  const t = useT();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    supported: micSupported,
    listening,
    transcript,
    start,
    stop,
    error: micError,
  } = useSpeechInput(lang, (finalText) => setText(finalText));

  async function handleContinue() {
    if (!text.trim()) {
      onSkip();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/profile-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      });
      const data = await res.json();
      onParsed((data?.profile as Partial<CitizenProfile> | undefined) ?? {});
    } catch {
      onParsed({});
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[560px] px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">{t('tellUsAboutYourself')}</h1>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={listening && transcript ? transcript : text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('oneLinePlaceholder')}
          className="min-h-[56px] flex-1 rounded-2xl border border-ink/15 bg-white px-4 text-lg text-ink focus-visible:border-marigold"
        />
        {micSupported && <MicButton listening={listening} onClick={() => (listening ? stop() : start())} />}
      </div>
      {listening && <p className="mt-2 text-sm text-marigold-ink">{t('micListening')}</p>}
      {!listening && micError && <p className="mt-2 text-sm text-haldi-ink">{t('voiceInputError')}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[48px] px-2 text-base font-medium text-slate underline hover:text-ink"
        >
          {t('skipAskMeQuestions')}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="flex min-h-[56px] items-center justify-center rounded-full bg-ink px-6 text-lg font-semibold text-paper disabled:opacity-50"
        >
          {loading ? t('understandingYou') : t('continueLabel')}
        </button>
      </div>
    </div>
  );
}
