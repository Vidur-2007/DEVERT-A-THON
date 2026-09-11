import { useT } from '@/lib/i18n/strings';

// Always visible on the result. SPEC.md Section 19: "preliminary guidance, not an official decision."
export function Disclaimer() {
  const t = useT();
  return <p className="mt-6 text-center text-xs text-slate">{t('disclaimerText')}</p>;
}
