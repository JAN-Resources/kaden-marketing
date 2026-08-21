/* Renders every narration line in src/demo/narration.ts to public/voice/<id>.mp3
   using Kokoro (onnx-community/Kokoro-82M-v1.0-ONNX), then writes a manifest with
   the duration of each clip so the demo can pace slides without loading the audio.

   Usage:  npm run voice:build
   Env:    KOKORO_VOICE (default af_heart), KOKORO_DTYPE (default fp32),
           KOKORO_SPEED (default 0.94), KOKORO_KBPS (default 64)

   Delivery is shaped in three passes, because a flat read of a whole paragraph
   sounds like a screen reader rather than a presenter:
     1. Each sentence is synthesised on its own, so Kokoro gives it a real
        opening and a real falling close instead of running everything together.
     2. Gaps between sentences are sized from punctuation and sentence length —
        short declaratives ("Reactive. Expensive.") land back-to-back, a question
        or a closing line gets room to breathe.
     3. Every sentence is peak-normalised and edge-faded, so no slide is quieter
        than the one before it and no splice clicks.
   Kokoro pads each utterance with roughly 400ms of its own silence at both ends.
   That padding is trimmed first — otherwise every boundary compounds to over a
   second and the read drags, which no amount of gap tuning can fix. It also drops
   the occasional 300ms+ silence into the middle of a phrase, which is heard as a
   stumble; those are capped, since a pause that long mid-sentence is never
   something a narrator would do.

   The model is downloaded once and cached by transformers.js. Generated audio is
   committed so the site needs no model download at runtime. */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KokoroTTS } from 'kokoro-js';
import lamejs from '@breezystack/lamejs';
import { NARRATION } from '../src/demo/narration.ts';

const ROOT     = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR  = join(ROOT, 'public', 'voice');
const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const VOICE    = process.env.KOKORO_VOICE ?? 'af_heart';
const DTYPE    = process.env.KOKORO_DTYPE ?? 'fp32';
const SPEED    = Number(process.env.KOKORO_SPEED ?? 0.94);
const KBPS     = Number(process.env.KOKORO_KBPS ?? 64);

const LEAD_IN_MS  = 120;  // keeps the first syllable from being clipped on play()
const LEAD_OUT_MS = 260;  // lets the final word settle before the slide turns
const FADE_MS     = 8;    // removes splice clicks at every join
const TRIM_FLOOR  = 0.004; // RMS below this counts as Kokoro's own padding
const TRIM_KEEP_MS= 25;   // margin left around speech so plosives survive
const HOLD_CLEAR  = 130;  // cap for mid-phrase silence when there is no punctuation
const HOLD_PUNCT  = 260;  // cap when the sentence has commas/dashes to honour
const PEAK        = 0.89; // normalisation target, leaves MP3 encoder headroom

/* Pronunciation fixes applied to the spoken text only — the copy in narration.ts
   and on screen is untouched.

   "H2S" is expanded rather than spelled out. Kokoro breaks for ~230ms between the
   digit and the trailing letter, which is heard as "H 2. S" — and no spelling
   avoids it: "H-two-S", "H-2-S", "H two ess" and the raw "H2S" all break in the
   same place, some worse. Spoken in full the term is continuous, and the only
   pause left falls at the phrase boundary after it, where a pause belongs.

   A spaced hyphen is read as a word, so those become commas. */
function speakable(text) {
  return text
    .replace(/H2S/g, 'hydrogen sulfide')
    .replace(/\bPPE\b/g, 'P P E')
    .replace(/\s+-\s+/g, ', ')   // parenthetical dashes -> comma pauses
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* Keeps terminal punctuation attached so the gap logic can read it. */
function sentences(text) {
  return text.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) ?? [text];
}

/* The cadence rules. A gap is a beat, and beats carry meaning:
   punchy fragments hit in sequence, questions and closers hang. */
function gapAfter(sentence, index, all) {
  const isLast  = index === all.length - 1;
  const words   = sentence.split(/\s+/).length;
  const ending  = sentence.trim().slice(-1);

  if (isLast) return 0;                    // tail silence covers the end of the clip
  if (ending === '?') return 420;          // let a question sit before answering it
  if (ending === '!') return 380;
  if (words <= 3)     return 190;          // "Reactive. Expensive." — staccato
  if (words <= 6)     return 280;
  return 340;                              // full thought, full beat
}

/* Strips the leading/trailing silence Kokoro emits around every utterance, so the
   gaps below are the gaps you actually hear. Measured on a 10ms RMS envelope. */
function trimSilence(clip, sampleRate) {
  const win = Math.round(sampleRate * 0.01);
  const loud = i => {
    let sum = 0;
    const end = Math.min(i + win, clip.length);
    for (let j = i; j < end; j++) sum += clip[j] * clip[j];
    return Math.sqrt(sum / (end - i)) >= TRIM_FLOOR;
  };
  let first = 0, last = clip.length - win;
  while (first < last && !loud(first)) first += win;
  while (last > first && !loud(last))  last -= win;
  const keep  = Math.round((TRIM_KEEP_MS / 1000) * sampleRate);
  const start = Math.max(0, first - keep);
  const stop  = Math.min(clip.length, last + win + keep);
  return stop > start ? clip.subarray(start, stop) : clip;
}

/* Kokoro sometimes drops an unnatural 300ms+ silence into the middle of a phrase.
   A sentence with no internal punctuation has nothing to pause for, so anything
   long is an artifact and gets capped tightly; sentences that do carry commas keep
   a longer allowance so their real pauses survive. */
function capInternalSilence(clip, sampleRate, sentence) {
  const limitMs = /[,;:—-]/.test(sentence.slice(0, -1)) ? HOLD_PUNCT : HOLD_CLEAR;
  const win     = Math.round(sampleRate * 0.01);
  const limit   = Math.round((limitMs / 1000) * sampleRate);

  const quiet = [];
  for (let i = 0; i + win <= clip.length; i += win) {
    let sum = 0;
    for (let j = i; j < i + win; j++) sum += clip[j] * clip[j];
    quiet.push(Math.sqrt(sum / win) < TRIM_FLOOR);
  }

  const keep = [];
  let run = 0;
  for (let w = 0; w < quiet.length; w++) {
    if (!quiet[w]) { run = 0; keep.push(w); continue; }
    run += win;
    if (run <= limit) keep.push(w);   // hold the allowed head of the pause, drop the rest
  }
  if (keep.length === quiet.length) return clip;

  const out = new Float32Array(keep.length * win + (clip.length % win));
  let offset = 0;
  for (const w of keep) { out.set(clip.subarray(w * win, w * win + win), offset); offset += win; }
  const remainder = clip.length - quiet.length * win;
  if (remainder > 0) { out.set(clip.subarray(clip.length - remainder), offset); offset += remainder; }
  return out.subarray(0, offset);
}

function silence(ms, sampleRate) {
  return new Float32Array(Math.round((ms / 1000) * sampleRate));
}

/* Even out level across sentences, then fade the edges so joins are inaudible. */
function shape(clip, sampleRate) {
  let peak = 0;
  for (let i = 0; i < clip.length; i++) peak = Math.max(peak, Math.abs(clip[i]));
  const gain = peak > 0 ? PEAK / peak : 1;

  const fade = Math.min(Math.round((FADE_MS / 1000) * sampleRate), Math.floor(clip.length / 2));
  const out  = new Float32Array(clip.length);
  for (let i = 0; i < clip.length; i++) {
    let g = gain;
    if (i < fade)                 g *= i / fade;
    if (i >= clip.length - fade)  g *= (clip.length - 1 - i) / fade;
    out[i] = clip[i] * g;
  }
  return out;
}

function concat(parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out   = new Float32Array(total);
  let offset  = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  return out;
}

function encodeMp3(samples, sampleRate) {
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, KBPS);
  const chunks  = [];
  const BLOCK   = 1152;
  for (let i = 0; i < pcm.length; i += BLOCK) {
    const buf = encoder.encodeBuffer(pcm.subarray(i, i + BLOCK));
    if (buf.length) chunks.push(Buffer.from(buf));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail));
  return Buffer.concat(chunks);
}

console.log(`Loading ${MODEL_ID} (dtype=${DTYPE}, voice=${VOICE}, speed=${SPEED})...`);
const tts = await KokoroTTS.from_pretrained(MODEL_ID, { dtype: DTYPE, device: 'cpu' });

await mkdir(OUT_DIR, { recursive: true });
const manifest = { voice: VOICE, model: MODEL_ID, speed: SPEED, clips: {} };

for (const { id, text, speed } of NARRATION) {
  const parts      = sentences(speakable(text));
  const rate       = speed ?? SPEED;
  let   sampleRate = 24000;
  const pieces     = [];

  for (const [i, part] of parts.entries()) {
    const audio = await tts.generate(part, { voice: VOICE, speed: rate });
    sampleRate  = audio.sampling_rate;
    if (i === 0) pieces.push(silence(LEAD_IN_MS, sampleRate));
    const spoken = capInternalSilence(trimSilence(audio.audio, sampleRate), sampleRate, part);
    pieces.push(shape(spoken, sampleRate));
    const gap = gapAfter(part, i, parts);
    if (gap) pieces.push(silence(gap, sampleRate));
  }
  pieces.push(silence(LEAD_OUT_MS, sampleRate));

  const samples  = concat(pieces);
  const duration = samples.length / sampleRate;
  const mp3      = encodeMp3(samples, sampleRate);
  await writeFile(join(OUT_DIR, `${id}.mp3`), mp3);
  manifest.clips[id] = { duration: Number(duration.toFixed(2)), bytes: mp3.length, speed: rate };
  console.log(`  ${id.padEnd(13)} ${duration.toFixed(1).padStart(5)}s  ${(mp3.length / 1024).toFixed(0).padStart(4)} KB  ${parts.length} sentence${parts.length > 1 ? 's' : ''} @ ${rate}x`);
}

await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const totalKb = Object.values(manifest.clips).reduce((n, c) => n + c.bytes, 0) / 1024;
console.log(`\nWrote ${NARRATION.length} clips (${totalKb.toFixed(0)} KB total) to public/voice/`);
