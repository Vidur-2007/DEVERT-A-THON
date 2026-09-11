'use client';

// Language context: reads/writes localStorage['ys:lang'] and sets <html lang>.
// See SPEC.md Section 10.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from '../types';

const STORAGE_KEY = 'ys:lang';
const SUPPORTED_LANGS: Lang[] = ['en', 'hi', 'te', 'ta'];

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // Pick up a previously chosen language once we're in the browser. This runs once,
  // after the server-rendered (English) markup has hydrated, so it can't mismatch --
  // reading localStorage during render instead would differ between server and client.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && (SUPPORTED_LANGS as string[]).includes(stored)) {
        // One-time sync from localStorage on mount, not a derived/cascading update.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(stored as Lang);
      }
    } catch {
      // localStorage unavailable (private browsing, blocked storage) - stay on English.
    }
  }, []);

  // Keep <html lang> in sync so screen readers and our CSS font-switching pick it up.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore write failures; the choice still applies for this session
    }
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider');
  return ctx;
}
