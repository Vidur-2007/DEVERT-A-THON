'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n/strings';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const t = useT();

  return (
    <header className="no-print border-b border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-heading text-xl font-bold text-ink no-underline">
          {t('appName')}
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
