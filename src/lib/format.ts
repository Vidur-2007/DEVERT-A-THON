// Number/currency formatting helpers -- Indian digit grouping and lakh-format quick picks.
// See SPEC.md Section 9.5 ("₹2,50,000" / "₹2.5 lakh") and Section 6.2 (quick picks).

import type { FieldDef } from './fields';
import type { Lang } from './types';
import { t } from './i18n/strings';

export function formatIndianNumber(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}

export function formatINR(n: number): string {
  return `₹${formatIndianNumber(n)}`;
}

/** ₹50,000 stays as-is; ₹1,00,000+ becomes "₹1 lakh" / "₹2.5 lakh". */
export function formatLakh(n: number): string {
  if (n >= 100000) {
    const lakh = n / 100000;
    const rounded = Number.isInteger(lakh) ? String(lakh) : lakh.toFixed(1).replace(/\.0$/, '');
    return `₹${rounded} lakh`;
  }
  return formatINR(n);
}

/** Formats one quick-pick chip's label for a number field, respecting its unit. */
export function formatQuickPickLabel(value: number, unit: FieldDef['unit'] | undefined, lang: Lang): string {
  switch (unit) {
    case 'INR':
      return formatLakh(value);
    case 'acres':
      return `${formatIndianNumber(value)} ${t(lang, 'unitAcres')}`;
    case 'percent':
      return `${value}%`;
    case 'people':
      return lang === 'en'
        ? `${value} ${value === 1 ? 'person' : 'people'}`
        : `${formatIndianNumber(value)} ${t(lang, 'unitPeople')}`;
    case 'years':
      return `${value}`;
    default:
      return formatIndianNumber(value);
  }
}
