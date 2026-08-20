import { useCallback, useEffect, useRef } from 'react';
import { NARRATION, NARRATION_BY_ID } from '../demo/narration';

/* Narration is pre-rendered with Kokoro (see scripts/generate-voice.mjs) and shipped
   as public/voice/<id>.mp3, so playback is instant and identical in every browser.
   If a clip cannot be fetched or decoded we fall back to the browser's speechSynthesis
   so the tour still narrates rather than sitting silent. */

const clipUrl = (id: string) => `${import.meta.env.BASE_URL}voice/${id}.mp3`;

export function useVoice() {
  const cache     = useRef(new Map<string, HTMLAudioElement>());
  const playing   = useRef<HTMLAudioElement | null>(null);
  const cancelled = useRef(false);

  const getClip = useCallback((id: string) => {
    let el = cache.current.get(id);
    if (!el) {
      el = new Audio(clipUrl(id));
      el.preload = 'auto';
      cache.current.set(id, el);
    }
    return el;
  }, []);

  /* Fetches every clip up front. Called from the same user gesture that starts the
     tour, which also satisfies autoplay policies for the clips that follow. */
  const prime = useCallback(() => {
    NARRATION.forEach(n => getClip(n.id).load());
  }, [getClip]);

  const stopFallback = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  /* Sentence-by-sentence so each utterance stays under Chrome's ~15s speech cutoff. */
  const speakFallback = useCallback((id: string, onEnd: () => void) => {
    const text = NARRATION_BY_ID[id]?.text;
    if (!text || !('speechSynthesis' in window)) { onEnd(); return; }
    const chunks = text.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) ?? [text];
    let idx = 0;
    const playNext = () => {
      if (cancelled.current) return;
      if (idx >= chunks.length) { onEnd(); return; }
      const utt = new SpeechSynthesisUtterance(chunks[idx++]);
      utt.rate  = 0.9;
      utt.pitch = 0.95;
      utt.onend = playNext;
      utt.onerror = e => {
        const code = (e as SpeechSynthesisErrorEvent).error;
        if (code === 'canceled' || code === 'interrupted') return;
        playNext();
      };
      window.speechSynthesis.speak(utt);
    };
    playNext();
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    const el = playing.current;
    if (el) {
      el.onended = null;
      el.onerror = null;
      el.pause();
      el.currentTime = 0;
      playing.current = null;
    }
    stopFallback();
  }, [stopFallback]);

  /** Plays the narration clip for a slide id, calling onEnd when it finishes. */
  const speak = useCallback((id: string, onEnd: () => void) => {
    cancel();
    cancelled.current = false;

    const el = getClip(id);
    playing.current = el;
    el.currentTime = 0;

    const finish = () => {
      if (cancelled.current || playing.current !== el) return;
      playing.current = null;
      onEnd();
    };
    const fallback = () => {
      if (cancelled.current || playing.current !== el) return;
      playing.current = null;
      speakFallback(id, onEnd);
    };

    el.onended = finish;
    el.onerror = fallback;
    el.play().catch(fallback);
  }, [cancel, getClip, speakFallback]);

  useEffect(() => cancel, [cancel]);

  return { speak, cancel, prime };
}
