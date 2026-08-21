/* Single source of truth for the demo narration.
   Imported by DemoPage for slide pacing/captions and by scripts/generate-voice.mjs,
   which renders each line to public/voice/<id>.mp3 with Kokoro.
   Re-run `npm run voice:build` after editing any text below. */

export type Narration = {
  /** Matches the slide id in DemoPage's SLIDES array and the audio filename. */
  id: string;
  /** Spoken text. "Kayden" is the phonetic spelling of Kaden for the TTS model. */
  text: string;
  /** Fallback pacing (ms) used when audio is unavailable or muted. */
  maxDuration: number;
  /** Kokoro delivery rate for this line; omit to use the generator default (0.94).
      Lower is slower and weightier — used on the bookend and payoff lines. */
  speed?: number;
};

export const NARRATION = [
  { id: 'hero',         text: 'Meet Kayden AI. Autonomous H2S control for the modern gas field.',                                                                                                                                                        maxDuration: 10000 , speed: 0.90 },
  { id: 'problem',      text: 'For years, managing H2S meant driving to remote sites, adjusting pumps by hand, and hoping nothing drifted out of spec between visits. Reactive. Expensive. And it still missed things.',                                  maxDuration: 14000 },
  { id: 'platform',     text: 'Kayden connects to every site you operate - anywhere in the world - and keeps watch around the clock, without a single site visit.',                                                                                       maxDuration: 12000 },
  { id: 'monitoring',   text: 'Every few seconds, Kayden reads your field instruments directly. Inlet H2S, outlet H2S, gas flow - all live, all the time.',                                                                                               maxDuration: 11000 },
  { id: 'scrubber',     text: 'Your scrubber tower, fully instrumented. Kayden watches every zone - packing beds, sump level, inlet and outlet conditions - all in real time.',                                                                           maxDuration: 12000 },
  { id: 'dosing',       text: 'Kayden calculates the optimal H2S scavenger dose for current conditions and writes that command directly to your pump. No call. No truck. No guesswork.',                                                                       maxDuration: 12000 },
  { id: 'dashboard',    text: 'This is Kayden in action. Live tag readings update every few seconds. The scrubber diagram shows real instrument data. The dosing panel is in Auto - writing commands to the pump without any manual input.',               maxDuration: 14000 },
  { id: 'alerts',       text: 'The moment any condition crosses a limit, you get a text on your phone instantly - before it becomes a problem.',                                                                                                          maxDuration: 11000 },
  { id: 'surveillance', text: 'Kayden also watches your site with AI vision. It detects chemical leaks in real time, identifies every worker on site, and checks PPE compliance - flagging anyone without a hard hat and alerting supervisors instantly.', maxDuration: 15000 },
  { id: 'chat',         text: 'Have a question about your site? Just ask Kayden. It analyzes your live data and answers in plain language - no spreadsheet digging required.',                                                                            maxDuration: 13000 },
  { id: 'analytics',    text: 'Every week, Kayden builds your analytics report automatically - efficiency trends, chemical usage, uptime - delivered to your inbox.',                                                                                     maxDuration: 12000 },
  { id: 'scheduling',   text: 'Kayden tracks your chemical inventory in real time and predicts exactly when each tank will run dry. It then lets you schedule the refill visit - and any other maintenance - all from one place.',                        maxDuration: 14000 },
  { id: 'marketplace',  text: 'And when you need supplies or spares, the Kayden marketplace knows your exact site configuration. Every item is pre-matched to your equipment - just order and ship direct to site.',                                       maxDuration: 13000 },
  { id: 'savings',      text: 'Less H2S scavenger wasted. Less labor. No towers out of spec. Kayden pays for itself.',                                                                                                                                        maxDuration: 10000 , speed: 0.90 },
  { id: 'requirements', text: 'Getting started with Kayden is simple. All you need on site is a PLC or RTU, H2S sensors at the inlet and outlet, a gas flow meter, a Modbus-capable dosing pump, and a cellular connection. And if you don\'t have everything in place yet - no problem. Jan Resources can supply and commission every piece of equipment you need, end to end.',                                                                                                                maxDuration: 20000 },
  { id: 'cta',          text: "Ready to put your H2S control on autopilot? Let's talk.",                                                                                                                                                                 maxDuration: Infinity , speed: 0.90 },
] satisfies Narration[];

export const NARRATION_BY_ID: Record<string, Narration> =
  Object.fromEntries(NARRATION.map(n => [n.id, n]));
