/* Fails the build when the committed narration audio no longer matches the script.

   Narration text and audio drift apart silently: a slide added without a clip
   falls back to the browser's speech synthesis mid-tour, and an edited line keeps
   narrating the old words. Neither breaks anything loudly, so the build checks.

   Run directly with `npm run voice:check`. Fix a failure with `npm run voice:build`. */

import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fingerprint } from './voice-shared.mjs';

/* narration.ts is imported directly so there is one typed source of truth. That
   relies on Node's built-in type stripping, which needs 22.18 or newer — on older
   runtimes the module loader throws ERR_UNKNOWN_FILE_EXTENSION, which says nothing
   useful about what to do next. */
let NARRATION;
try {
  ({ NARRATION } = await import('../src/demo/narration.ts'));
} catch (err) {
  if (err?.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
    console.error(`This check reads src/demo/narration.ts directly, which needs Node 22.18 or newer.`);
    console.error(`Running Node ${process.version}. Upgrade Node, or skip it with \`npx vite build\`.`);
    process.exit(1);
  }
  throw err;
}

const ROOT     = join(dirname(fileURLToPath(import.meta.url)), '..');
const VOICE_DIR = join(ROOT, 'public', 'voice');

const exists = async p => access(p).then(() => true, () => false);

const manifestPath = join(VOICE_DIR, 'manifest.json');
if (!await exists(manifestPath)) {
  console.error('No public/voice/manifest.json. Run `npm run voice:build`.');
  process.exit(1);
}
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const problems = [];

for (const { id, text, speed } of NARRATION) {
  const clip = manifest.clips?.[id];
  if (!clip) {
    problems.push(`${id}: no clip — this slide would fall back to the browser voice`);
    continue;
  }
  if (!await exists(join(VOICE_DIR, `${id}.mp3`))) {
    problems.push(`${id}: manifest lists a clip but ${id}.mp3 is missing`);
    continue;
  }
  const expected = fingerprint({
    text,
    voice: manifest.voice,
    rate:  speed ?? manifest.speed,
    kbps:  manifest.kbps,
  });
  if (clip.fingerprint !== expected) {
    problems.push(`${id}: audio was rendered from different text or settings`);
  }
}

const orphans = Object.keys(manifest.clips ?? {}).filter(id => !NARRATION.some(n => n.id === id));
for (const id of orphans) problems.push(`${id}: clip exists but no narration line uses it`);

if (problems.length) {
  console.error(`Narration audio is out of date (${problems.length} problem${problems.length > 1 ? 's' : ''}):`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\nRun `npm run voice:build` to re-render, then commit public/voice/.');
  process.exit(1);
}

console.log(`Narration audio matches the script (${NARRATION.length} clips).`);
