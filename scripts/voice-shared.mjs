/* Shared between scripts/generate-voice.mjs, which renders the narration clips, and
   scripts/check-voice.mjs, which fails the build when they no longer match the script.
   Both must agree on what a clip is derived from, so it lives in one place. */

import { createHash } from 'node:crypto';

/* Everything that shapes the rendered audio. A change to any of it makes the
   committed clips stale, so it is folded into the fingerprint below. */
export const SHAPING = {
  leadInMs:   120,   // keeps the first syllable from being clipped on play()
  leadOutMs:  260,   // lets the final word settle before the slide turns
  fadeMs:     8,     // removes splice clicks at every join
  peak:       0.89,  // normalisation target, leaves MP3 encoder headroom
  trimFloor:  0.004, // RMS below this counts as Kokoro's own padding
  trimKeepMs: 25,    // margin left around speech so plosives survive
  holdClear:  130,   // cap for mid-phrase silence when there is no punctuation
  holdPunct:  260,   // cap when the sentence has commas/dashes to honour
  gap: {             // beat after a sentence, by how it ends and how long it is
    question: 420,
    exclaim:  380,
    short:    190,   // <= 3 words — "Reactive. Expensive." runs staccato
    medium:   280,   // <= 6 words
    long:     340,
  },
};

/* Pronunciation fixes applied to the spoken text only — the copy in narration.ts
   and on screen is untouched.

   "H2S" is expanded rather than spelled out. Kokoro breaks for ~230ms between the
   digit and the trailing letter, which is heard as "H 2. S" — and no spelling
   avoids it: "H-two-S", "H-2-S", "H two ess" and the raw "H2S" all break in the
   same place, some worse. Spoken in full the term is continuous, and the only
   pause left falls at the phrase boundary after it, where a pause belongs.

   A spaced hyphen is read as a word, so those become commas. */
export function speakable(text) {
  return text
    .replace(/H2S/g, 'hydrogen sulfide')
    .replace(/\bPPE\b/g, 'P P E')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* Identifies the audio a given line should produce. Stored per clip in the
   manifest so drift between narration.ts and public/voice/ is detectable without
   loading the model or the audio. */
export function fingerprint({ text, voice, rate, kbps }) {
  return createHash('sha256')
    .update(JSON.stringify({ spoken: speakable(text), voice, rate, kbps, SHAPING }))
    .digest('hex')
    .slice(0, 16);
}
