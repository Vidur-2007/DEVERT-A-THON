// Client-only persistence: the citizen's profile, and any schemes they've uploaded.
// No login, no database, no server round trip. SPEC.md Section 3 USP #6 and Section 8.1
// ("Uploaded schemes get id u-<hash> and are saved to localStorage so they appear in the library").

import type { CitizenProfile, Scheme } from './types';

const PROFILE_KEY = 'ys:profile';
const UPLOADS_KEY = 'ys:uploads';
const MAX_UPLOADS = 20; // keep the most recent N; older ones are dropped, not the server cache

export function getStoredProfile(): CitizenProfile {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as CitizenProfile;
    }
    return {};
  } catch {
    // Corrupt JSON or storage unavailable (private browsing) - start fresh.
    return {};
  }
}

export function saveProfile(profile: CitizenProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage full or blocked - the profile just won't persist this session.
  }
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
}

export function hasStoredProfile(): boolean {
  return Object.keys(getStoredProfile()).length > 0;
}

export function getUploadedSchemes(): Scheme[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(UPLOADS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Scheme[]) : [];
  } catch {
    return [];
  }
}

export function getUploadedScheme(id: string): Scheme | undefined {
  return getUploadedSchemes().find((s) => s.id === id);
}

/** Saves (or replaces, if re-uploaded) one scheme, most-recent first, capped at MAX_UPLOADS. */
export function saveUploadedScheme(scheme: Scheme): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getUploadedSchemes().filter((s) => s.id !== scheme.id);
    const next = [scheme, ...existing].slice(0, MAX_UPLOADS);
    window.localStorage.setItem(UPLOADS_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked - the scheme still works for this session via server cache.
  }
}
