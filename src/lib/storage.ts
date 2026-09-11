// Client-only persistence for the citizen's profile. One profile, shared across every
// scheme check (SPEC.md Section 3 USP #6) -- no login, no database, no server round trip.

import type { CitizenProfile } from './types';

const PROFILE_KEY = 'ys:profile';

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
