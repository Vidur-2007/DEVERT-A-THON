'use client';

// Speech-to-text via the Web Speech API. See SPEC.md Section 10.
// Feature-detected (window.SpeechRecognition || window.webkitSpeechRecognition);
// callers must hide their mic UI when `supported` is false. Needs HTTPS or localhost.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '../types';

const RECOGNITION_LANG: Record<Lang, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN' };

// The Web Speech recognition API is not yet part of TypeScript's standard DOM lib
// (still vendor-prefixed in Chrome), so it's typed by hand here rather than assumed global.
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent {
  readonly error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface UseSpeechInputResult {
  /** False on the server and in browsers without the Web Speech API -- hide mic UI then. */
  supported: boolean;
  listening: boolean;
  /** The latest (possibly interim) transcript, for "we heard: ..." feedback while listening. */
  transcript: string;
  start: () => void;
  stop: () => void;
  error: string | null;
}

/** `onFinalResult` fires once per utterance, when the recognizer is confident it's done. */
export function useSpeechInput(lang: Lang, onFinalResult?: (transcript: string) => void): UseSpeechInputResult {
  // Starts false on both the server and the client's first (hydration) render, then
  // flips after mount -- checking synchronously during render would disagree between
  // server (no `window`) and client, causing a hydration mismatch.
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time feature detection after mount
    setSupported(isSpeechRecognitionSupported());
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('unsupported');
      return;
    }
    recognitionRef.current?.stop();

    const recognition = new Ctor();
    recognition.lang = RECOGNITION_LANG[lang];
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const text = result?.[0]?.transcript ?? '';
      setTranscript(text);
      if (result?.isFinal) onFinalResultRef.current?.(text);
    };
    recognition.onerror = (event) => {
      setError(event.error || 'error');
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setTranscript('');
    setError(null);
    setListening(true);
    recognition.start();
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  // Stop listening if the component unmounts mid-utterance.
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { supported, listening, transcript, start, stop, error };
}
