'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useLang } from '@/lib/i18n/useLang';
import { useT } from '@/lib/i18n/strings';
import { findVoiceForLang, isSpeechSynthesisSupported, speak, stopSpeaking } from '@/lib/speech/speak';

interface SpeakButtonProps {
  text: string;
}

// 🔊 Read aloud, on the Explainer and Result pages. SPEC.md Section 8.2/8.4/10:
// hidden entirely when this browser has no voice for the current language, rather
// than reading with a wrong-language voice.
export function SpeakButton({ text }: SpeakButtonProps) {
  const { lang } = useLang();
  const t = useT();
  // Starts false on both server and the client's first render, then flips after
  // mount -- same hydration-safe pattern as useSpeechInput's `supported`.
  const [available, setAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // One-time (per lang) feature/voice detection after mount, not state derived from props.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isSpeechSynthesisSupported()) {
      setAvailable(false);
      return;
    }
    function check() {
      setAvailable(Boolean(findVoiceForLang(lang)));
    }
    check();
    /* eslint-enable react-hooks/set-state-in-effect */
    // Chrome loads voices asynchronously; this fires once they're ready.
    window.speechSynthesis.addEventListener('voiceschanged', check);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check);
  }, [lang]);

  // Stop mid-utterance if we unmount or the text/language changes under us.
  useEffect(() => {
    return () => stopSpeaking();
  }, [text, lang]);

  if (!available) return null;

  function handleClick() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const utterance = speak(text, lang, () => setSpeaking(false));
    setSpeaking(Boolean(utterance));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={speaking}
      className="no-print inline-flex flex-none items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:border-marigold focus-visible:outline-none"
    >
      <Volume2 size={16} aria-hidden="true" className={speaking ? 'text-marigold' : ''} />
      {speaking ? t('stopReading') : t('readAloud')}
    </button>
  );
}
