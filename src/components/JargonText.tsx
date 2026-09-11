'use client';

import { Fragment, useState } from 'react';
import type { Scheme } from '@/lib/types';

interface JargonTextProps {
  text: string;
  jargon: Scheme['jargon'];
  className?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Underlines jargon terms with a dotted line; tapping one shows its plain-language
// meaning inline. See SPEC.md Section 8.2 item 9.
export function JargonText({ text, jargon, className }: JargonTextProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (jargon.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Longest term first, so a multi-word term matches before a shorter substring of it.
  const terms = [...jargon].sort((a, b) => b.term.length - a.term.length);
  const pattern = new RegExp(`(${terms.map((j) => escapeRegExp(j.term)).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const match = terms.find((j) => j.term.toLowerCase() === part.toLowerCase());
        if (!match) return <Fragment key={index}>{part}</Fragment>;

        const key = `${match.term}-${index}`;
        const isOpen = openKey === key;
        return (
          <span key={key} className="relative">
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : key)}
              aria-expanded={isOpen}
              className="text-inherit underline decoration-slate decoration-dotted underline-offset-4"
            >
              {part}
            </button>
            {isOpen && (
              <span
                role="tooltip"
                className="absolute left-0 top-full z-10 mt-1 w-64 max-w-[80vw] rounded-lg bg-ink px-3 py-2 text-sm font-normal not-italic text-paper shadow-lg"
              >
                {match.meaning}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
