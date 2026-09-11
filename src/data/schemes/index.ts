// Seed scheme library. See SPEC.md Section 12.
// No data/raw text was supplied for these seeds, so every rule is authored from the
// spec's own notes and marked verified: false (SPEC.md Section 12 fallback path).
// A human must check every number against the official source before a real demo.

import type { Scheme } from '@/lib/types';

import pmKisan from './pm-kisan.json';
import apy from './apy.json';
import pmjjby from './pmjjby.json';
import pmsby from './pmsby.json';
import ssy from './ssy.json';
import pmuy from './pmuy.json';
import pmjay from './pmjay.json';
import pmSvanidhi from './pm-svanidhi.json';

export const SCHEMES: Scheme[] = [
  pmKisan,
  apy,
  pmjjby,
  pmsby,
  ssy,
  pmuy,
  pmjay,
  pmSvanidhi,
] as Scheme[];

export const SCHEMES_BY_ID: Record<string, Scheme> = Object.fromEntries(
  SCHEMES.map((scheme) => [scheme.id, scheme]),
);

export function getScheme(id: string): Scheme | undefined {
  return SCHEMES_BY_ID[id];
}
