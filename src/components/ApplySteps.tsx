import { ExternalLink, Phone } from 'lucide-react';
import type { Scheme } from '@/lib/types';
import { useT } from '@/lib/i18n/strings';
import { JargonText } from './JargonText';

interface ApplyStepsProps {
  steps: Scheme['summary']['howToApply'];
  jargon: Scheme['jargon'];
  officialUrl?: string;
  helpline?: string;
}

// Numbered step timeline + official link/helpline. Shared by the Explainer (8.2) and Result (8.4).
export function ApplySteps({ steps, jargon, officialUrl, helpline }: ApplyStepsProps) {
  const t = useT();

  return (
    <div>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-ink">
                <JargonText text={step.title} jargon={jargon} />
              </p>
              <p className="text-sm text-slate">
                <JargonText text={step.detail} jargon={jargon} />
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-marigold underline"
          >
            <ExternalLink size={14} aria-hidden="true" /> {t('officialWebsite')}
          </a>
        )}
        {helpline && (
          <a href={`tel:${helpline}`} className="inline-flex items-center gap-1 text-marigold underline">
            <Phone size={14} aria-hidden="true" /> {helpline}
          </a>
        )}
      </div>
    </div>
  );
}
