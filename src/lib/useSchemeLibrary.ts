'use client';

// Merges the static seed library with whatever the citizen has uploaded this browser.
// Seeds resolve instantly (safe for SSR); uploads only exist in localStorage, so they're
// added after mount -- same "no hydration mismatch" pattern as useLang.tsx.

import { useEffect, useState } from 'react';
import { SCHEMES, getScheme as getSeedScheme } from '@/data/schemes';
import { getUploadedScheme, getUploadedSchemes } from './storage';
import type { Scheme } from './types';

/** SCHEMES (seeds) plus any uploaded schemes, once we're past hydration. */
export function useSchemeLibrary(): Scheme[] {
  const [library, setLibrary] = useState<Scheme[]>(SCHEMES);

  useEffect(() => {
    const uploaded = getUploadedSchemes();
    if (uploaded.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time merge of localStorage uploads after mount
      setLibrary([...SCHEMES, ...uploaded]);
    }
  }, []);

  return library;
}

interface SchemeLookup {
  id: string;
  scheme: Scheme | undefined;
  checked: boolean;
}

function resolveSeedOnly(id: string): SchemeLookup {
  const seed = getSeedScheme(id);
  return { id, scheme: seed, checked: Boolean(seed) };
}

/**
 * Resolves a scheme by id: seeds resolve synchronously (identical on server and client);
 * an uploaded scheme is only checked after mount, so `checked` stays false for one tick
 * for an unrecognised id -- render a neutral loading state then, not "not found".
 *
 * Route params can change without unmounting this component (e.g. a client-side <Link>
 * from one /scheme/[id] page to another), so state is keyed by id and re-resolved
 * synchronously on every render until the effect below catches up -- otherwise a
 * navigation could flash the *previous* scheme's content under the new id.
 */
export function useSchemeById(id: string): { scheme: Scheme | undefined; checked: boolean } {
  const [state, setState] = useState<SchemeLookup>(() => resolveSeedOnly(id));

  useEffect(() => {
    const seed = getSeedScheme(id);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage lookup after mount/id-change */
    setState({ id, scheme: seed ?? getUploadedScheme(id), checked: true });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [id]);

  if (state.id !== id) {
    // The id changed since the last effect run; fall back to the synchronous (seed-only)
    // answer for this render rather than showing the previous id's scheme.
    return resolveSeedOnly(id);
  }
  return { scheme: state.scheme, checked: state.checked };
}
