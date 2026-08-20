import { useCallback, useRef } from 'react';

export function useVoice() {
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, muted: boolean) => {
    window.speechSynthesis.cancel();
    if (muted || !('speechSynthesis' in window)) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88;
    utt.pitch = 0.95;
    utt.volume = 1;
    uttRef.current = utt;
    // Chrome bug: speech stops after ~15s on some versions — resume it
    const resumeTimer = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 5000);
    utt.onend = () => clearInterval(resumeTimer);
    utt.onerror = () => clearInterval(resumeTimer);
    window.speechSynthesis.speak(utt);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, cancel };
}
