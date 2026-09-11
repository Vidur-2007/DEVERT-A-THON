import type { Scheme } from '@/lib/types';
import { JargonText } from './JargonText';

interface BenefitCardProps {
  benefit: Scheme['summary']['benefits'][number];
  jargon?: Scheme['jargon'];
}

export function BenefitCard({ benefit, jargon = [] }: BenefitCardProps) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      {benefit.amount && <p className="font-heading text-2xl font-bold text-marigold">{benefit.amount}</p>}
      <p className={benefit.amount ? 'mt-1 text-base text-ink' : 'text-base text-ink'}>
        <JargonText text={benefit.text} jargon={jargon} />
      </p>
    </div>
  );
}
