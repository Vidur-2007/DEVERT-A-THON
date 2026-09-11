// Text-to-speech via the Web Speech API. See SPEC.md Section 10: use a voice whose
// lang starts with the target locale; if none exists, the caller must hide the
// speak button for that language rather than reading with a wrong voice.

import type { Lang } from '../types';

const SPEECH_LANG: Record<Lang, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN' };

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** The best available voice for `lang`, or null if this browser has none -- hide the button then. */
export function findVoiceForLang(lang: Lang): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const target = SPEECH_LANG[lang].toLowerCase();
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((v) => v.lang.toLowerCase() === target);
  if (exact) return exact;
  const prefix = target.split('-')[0];
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
}

/** Speaks `text` in `lang` if a voice exists; returns the utterance (so callers can track
 * completion via onend/onerror) or null if speech synthesis/that voice isn't available. */
export function speak(text: string, lang: Lang, onEnd?: () => void): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voice = findVoiceForLang(lang);
  if (!voice) return null;

  window.speechSynthesis.cancel(); // stop anything already playing
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
