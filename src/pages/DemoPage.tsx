import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { DemoSlide } from '../components/demo/DemoSlide';
import { SlideHero } from '../components/demo/SlideHero';
import { SlideProblem } from '../components/demo/SlideProblem';
import { SlidePlatform } from '../components/demo/SlidePlatform';
import { SlideMonitoring } from '../components/demo/SlideMonitoring';
import { SlideScrubber } from '../components/demo/SlideScrubber';
import { SlideDosing } from '../components/demo/SlideDosing';
import { SlideAlerts } from '../components/demo/SlideAlerts';
import { SlideSurveillance } from '../components/demo/SlideSurveillance';
import { SlideDashboard } from '../components/demo/SlideDashboard';
import { SlideChat } from '../components/demo/SlideChat';
import { SlideAnalytics } from '../components/demo/SlideAnalytics';
import { SlideScheduling } from '../components/demo/SlideScheduling';
import { SlideMarketplace } from '../components/demo/SlideMarketplace';
import { SlideSavings } from '../components/demo/SlideSavings';
import { SlideCTA } from '../components/demo/SlideCTA';

/* Pick the best-sounding female voice available in the browser.
   On Windows: Microsoft Aria/Jenny Online (Natural) sound excellent.
   On macOS: Samantha / Karen are natural-sounding. */
let _cachedVoice: SpeechSynthesisVoice | null | undefined;
function getBestFemaleVoice(): SpeechSynthesisVoice | null {
  if (_cachedVoice !== undefined) return _cachedVoice;
  const all = window.speechSynthesis.getVoices();
  if (!all.length) return null;

  const PREFERRED = [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Ava Online (Natural) - English (United States)',
    'Microsoft Emma Online (Natural) - English (United Kingdom)',
    'Google US English',
    'Samantha',
    'Karen',
    'Victoria',
    'Moira',
    'Tessa',
  ];
  for (const name of PREFERRED) {
    const v = all.find(v => v.name === name);
    if (v) { _cachedVoice = v; return v; }
  }
  const MALE = ['david', 'mark', 'james', 'guy', 'fred', 'arthur', 'george', 'thomas', 'oliver'];
  _cachedVoice = all.find(v =>
    v.lang.startsWith('en') && !MALE.some(m => v.name.toLowerCase().includes(m))
  ) ?? all.find(v => v.lang.startsWith('en')) ?? null;
  return _cachedVoice;
}

const SLIDES = [
  { id: 'hero',        Component: SlideHero,        voice: 'Meet Kaden AI. Autonomous H2S control for the modern gas field.',                                                                                                                            maxDuration: 10000 },
  { id: 'problem',     Component: SlideProblem,     voice: 'For years, managing H2S meant driving to remote sites, adjusting pumps by hand, and hoping nothing drifted out of spec between visits. Reactive. Expensive. And it still missed things.',    maxDuration: 14000 },
  { id: 'platform',    Component: SlidePlatform,    voice: 'Kaden connects to every site you operate - anywhere in the world - and keeps watch around the clock, without a single site visit.',                                                        maxDuration: 12000 },
  { id: 'monitoring',  Component: SlideMonitoring,  voice: 'Every few seconds, Kaden reads your field instruments directly. Inlet H2S, outlet H2S, gas flow - all live, all the time.',                                                               maxDuration: 11000 },
  { id: 'scrubber',    Component: SlideScrubber,    voice: 'Your scrubber tower, fully instrumented. Kaden watches every zone - packing beds, sump level, inlet and outlet conditions - all in real time.',                                            maxDuration: 12000 },
  { id: 'dosing',      Component: SlideDosing,      voice: 'Kaden calculates the optimal triazene dose for current conditions and writes that command directly to your pump. No call. No truck. No guesswork.',                                        maxDuration: 12000 },
  { id: 'dashboard',   Component: SlideDashboard,   voice: 'This is Kaden in action. Live tag readings update every few seconds. The scrubber diagram shows real instrument data. The dosing panel is in Auto - writing commands to the pump without any manual input.', maxDuration: 14000 },
  { id: 'alerts',        Component: SlideAlerts,        voice: 'The moment any condition crosses a limit, you get a text on your phone instantly - before it becomes a problem.',                                                                                                     maxDuration: 11000 },
  { id: 'surveillance', Component: SlideSurveillance, voice: 'Kaden also watches your site with AI vision. It detects chemical leaks in real time, identifies every worker on site, and checks PPE compliance - flagging anyone without a hard hat and alerting supervisors instantly.', maxDuration: 15000 },
  { id: 'chat',        Component: SlideChat,        voice: 'Have a question about your site? Just ask Kaden. It analyzes your live data and answers in plain language - no spreadsheet digging required.',                                              maxDuration: 13000 },
  { id: 'analytics',   Component: SlideAnalytics,   voice: 'Every week, Kaden builds your analytics report automatically - efficiency trends, chemical usage, uptime - delivered to your inbox.',                                                       maxDuration: 12000 },
  { id: 'scheduling',  Component: SlideScheduling,  voice: 'Kaden tracks your chemical inventory in real time and predicts exactly when each tank will run dry. It then lets you schedule the refill visit - and any other maintenance - all from one place.',  maxDuration: 14000 },
  { id: 'marketplace', Component: SlideMarketplace, voice: 'And when you need supplies or spares, the Kaden marketplace knows your exact site configuration. Every item is pre-matched to your equipment - just order and ship direct to site.',         maxDuration: 13000 },
  { id: 'savings',     Component: SlideSavings,     voice: 'Less triazene wasted. Less labor. No towers out of spec. Kaden pays for itself.',                                                                                                           maxDuration: 10000 },
  { id: 'cta',         Component: SlideCTA,         voice: "Ready to put your H2S control on autopilot? Let's talk.",                                                                                                                                   maxDuration: Infinity },
] as const;

export function DemoPage() {
  const [current, setCurrent]       = useState(0);
  const [direction, setDirection]   = useState(1);
  const [started, setStarted]       = useState(false);
  const [muted, setMuted]           = useState(false);
  const [paused, setPaused]         = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const genRef          = useRef(0);
  const timerIds        = useRef<number[]>([]);
  const startedRef      = useRef(false);
  const mutedRef        = useRef(false);
  const pausedRef       = useRef(false);
  const audioEnabledRef = useRef(false);

  startedRef.current      = started;
  mutedRef.current        = muted;
  pausedRef.current       = paused;
  audioEnabledRef.current = audioEnabled;

  const stopAll = useCallback(() => {
    genRef.current++;
    timerIds.current.forEach(id => { clearTimeout(id); clearInterval(id); });
    timerIds.current = [];
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((text: string, onEnd: () => void) => {
    if (!('speechSynthesis' in window)) {
      onEnd();
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = 0.87;
    utt.pitch = 0.95;
    const femaleVoice = getBestFemaleVoice();
    if (femaleVoice) utt.voice = femaleVoice;
    utt.onend = onEnd;
    utt.onerror = (e) => {
      const code = (e as SpeechSynthesisErrorEvent).error;
      if (code === 'canceled' || code === 'interrupted') return;
      onEnd();
    };
    window.speechSynthesis.speak(utt);
    const resumeId = window.setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 5000) as unknown as number;
    timerIds.current.push(resumeId);
  }, []);

  const runSlide = useCallback((slideIndex: number) => {
    const gen = ++genRef.current;
    timerIds.current.forEach(id => { clearTimeout(id); clearInterval(id); });
    timerIds.current = [];
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const slide = SLIDES[slideIndex];
    if (slide.maxDuration === Infinity) return;

    const stale = () => gen !== genRef.current;

    const advance = () => {
      if (stale()) return;
      genRef.current++;
      timerIds.current.forEach(id => { clearTimeout(id); clearInterval(id); });
      timerIds.current = [];
      setDirection(1);
      setCurrent(c => Math.min(c + 1, SLIDES.length - 1));
    };

    const capId = window.setTimeout(advance, slide.maxDuration) as unknown as number;
    timerIds.current.push(capId);

    if (audioEnabledRef.current && !mutedRef.current) {
      speak(slide.voice, () => {
        if (stale()) return;
        const t = window.setTimeout(advance, 1800) as unknown as number;
        timerIds.current.push(t);
      });
    } else {
      const t = window.setTimeout(advance, 6000) as unknown as number;
      timerIds.current.push(t);
    }
  }, [speak]);

  /* Restart slide runner whenever the slide or audio state changes */
  useEffect(() => {
    if (!startedRef.current || pausedRef.current) return;
    runSlide(current);
    return () => { stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, started, audioEnabled]);

  /* Resume after un-mute */
  useEffect(() => {
    if (pausedRef.current || !audioEnabledRef.current) return;
    runSlide(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  const goTo = useCallback((index: number, dir: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    stopAll();
    setPaused(false);
    setDirection(dir);
    setCurrent(index);
  }, [stopAll]);

  const next = useCallback(() => goTo(current + 1,  1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  const togglePause = useCallback(() => {
    setPaused(p => {
      const nowPaused = !p;
      if (nowPaused) { stopAll(); }
      else           { runSlide(current); }
      return nowPaused;
    });
  }, [current, runSlide, stopAll]);

  /* "Get a Tour" — satisfies browser autoplay policy, starts tour + audio */
  const handleStart = useCallback(() => {
    setStarted(true);
    setAudioEnabled(true);
    setMuted(false);
  }, []);

  const handleVolumeClick = useCallback(() => setMuted(m => !m), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === ' ')          { e.preventDefault(); togglePause(); }
      if (e.key === 'm')          handleVolumeClick();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, togglePause, handleVolumeClick]);

  const SlideComp = SLIDES[current].Component;
  const volumeIcon  = muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />;
  const volumeTitle = muted ? 'Unmute (M)' : 'Mute (M)';

  return (
    <div className="relative w-full h-full bg-[#0c0c0e] overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/3 -left-1/4 w-[80vw] h-[80vh] rounded-full bg-white/[0.015] blur-[160px]" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[70vw] h-[70vh] rounded-full bg-white/[0.01] blur-[140px]" />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <DemoSlide key={SLIDES[current].id} direction={direction}>
          <SlideComp started={started} onStart={handleStart} />
        </DemoSlide>
      </AnimatePresence>

      {started && (
        <>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/[0.08]">
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{ width: `${((current + 1) / SLIDES.length) * 100}%`, background: '#4ade80', opacity: 0.7 }}
            />
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleVolumeClick}
                className="p-2 rounded-full transition-all"
                style={{ color: muted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)' }}
                title={volumeTitle}
              >
                {volumeIcon}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-white/20 tabular-nums">
                {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </span>
              <button
                onClick={togglePause}
                className="p-2 rounded-full text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                title={paused ? 'Resume (Space)' : 'Pause (Space)'}
              >
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Arrow nav */}
          <button onClick={prev} disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-0 disabled:pointer-events-none">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={next} disabled={current === SLIDES.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-0 disabled:pointer-events-none">
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dot nav */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === current ? 20 : 5,
                  height: 5,
                  background: i === current ? '#4ade80' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>

          {/* Paused overlay */}
          {paused && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="glass px-5 py-3 flex items-center gap-2.5 opacity-80">
                <Pause className="w-4 h-4 text-white/50" />
                <span className="text-xs font-mono text-white/50 tracking-widest">PAUSED</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
