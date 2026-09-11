'use client';

import { useLang } from '@/lib/i18n/useLang';
import type { Lang } from '@/lib/types';

// English and Hindi listed first (SPEC Section 10); Telugu and Tamil follow.
const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div role="radiogroup" aria-label="Choose your language" className="flex flex-wrap gap-2">
      {LANGUAGES.map(({ code, label }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLang(code)}
            className={`flex min-h-[48px] items-center rounded-full px-4 text-base font-medium transition-colors focus-visible:outline-none ${
              active
                ? 'bg-ink text-paper'
                : 'border border-slate/30 bg-white text-ink hover:border-ink'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
