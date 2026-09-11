// Picks the ~8 most useful questions to ask across the *whole* library, for /discover's
// "find schemes for me" wizard. See SPEC.md Section 8.5. Pure logic, no React.

import type { FieldKey, Scheme } from './types';

/** Ranks real profile fields (never 'custom', which is scheme-specific) by how many
 * distinct schemes in `library` reference them, most-used first. */
export function topFieldsAcrossLibrary(library: Scheme[], limit = 8): FieldKey[] {
  const schemesByField = new Map<FieldKey, Set<string>>();

  for (const scheme of library) {
    const fieldsInThisScheme = new Set<FieldKey>();
    for (const group of scheme.eligibility) {
      for (const rule of group.rules) {
        if (rule.field !== 'custom') fieldsInThisScheme.add(rule.field);
      }
    }
    for (const rule of scheme.exclusions) {
      if (rule.field !== 'custom') fieldsInThisScheme.add(rule.field);
    }
    for (const field of fieldsInThisScheme) {
      if (!schemesByField.has(field)) schemesByField.set(field, new Set());
      schemesByField.get(field)?.add(scheme.id);
    }
  }

  return [...schemesByField.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, limit)
    .map(([field]) => field);
}
