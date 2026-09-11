// Shared verdict -> colour/icon/label mapping, used by VerdictStamp and AltSchemeCard so
// the two never drift apart. See SPEC.md Section 9.4 and 8.4 item 1.

import { Check, CheckCheck, HelpCircle, X, type LucideIcon } from 'lucide-react';
import type { Verdict } from './types';
import type { StringKey } from './i18n/strings';

export interface VerdictMeta {
  textClass: string;
  bgClass: string;
  ringClass: string;
  fillClass: string;
  Icon: LucideIcon;
  labelKey: StringKey;
  /** 'filled' = solid ring (confident verdict), 'outline' = dashed ring (softer verdict). */
  ring: 'filled' | 'outline';
}

export const VERDICT_META: Record<Verdict, VerdictMeta> = {
  ELIGIBLE: {
    textClass: 'text-leaf',
    bgClass: 'bg-leaf/10',
    ringClass: 'stroke-leaf',
    fillClass: 'fill-leaf',
    Icon: Check,
    labelKey: 'verdictEligible',
    ring: 'filled',
  },
  LIKELY_ELIGIBLE: {
    textClass: 'text-leaf',
    bgClass: 'bg-leaf/10',
    ringClass: 'stroke-leaf',
    fillClass: 'fill-leaf',
    Icon: CheckCheck,
    labelKey: 'verdictLikelyEligible',
    ring: 'outline',
  },
  NEED_MORE_INFO: {
    textClass: 'text-haldi-ink',
    bgClass: 'bg-haldi-bg',
    ringClass: 'stroke-haldi',
    fillClass: 'fill-haldi',
    Icon: HelpCircle,
    labelKey: 'verdictNeedMoreInfo',
    ring: 'outline',
  },
  NOT_ELIGIBLE: {
    textClass: 'text-sindoor',
    bgClass: 'bg-sindoor/10',
    ringClass: 'stroke-sindoor',
    fillClass: 'fill-sindoor',
    Icon: X,
    labelKey: 'verdictNotEligible',
    ring: 'filled',
  },
};
