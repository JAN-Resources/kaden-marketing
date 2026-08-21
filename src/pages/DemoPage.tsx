import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { DemoSlide } from '../components/demo/DemoSlide';
import { KadenBrandMark } from '../components/KadenBrandMark';
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
import { SlideSecurity } from '../components/demo/SlideSecurity';
import { SlideRequirements } from '../components/demo/SlideRequirements';
import { SlideCTA } from '../components/demo/SlideCTA';
import { NARRATION } from '../demo/narration';
import { useVoice } from '../hooks/useVoice';

const COMPONENTS: Record<string, typeof SlideHero> = {
  hero:         SlideHero,
  problem:      SlideProblem,
  platform:     SlidePlatform,
  monitoring:   SlideMonitoring,
  scrubber:     SlideScrubber,
  dosing:       SlideDosing,
  dashboard:    SlideDashboard,
  alerts:       SlideAlerts,
  surveillance: SlideSurveillance,
  chat:         SlideChat,
  analytics:    SlideAnalytics,
  scheduling:   SlideScheduling,
  marketplace:  SlideMarketplace,
  savings:      SlideSavings,
  security:     SlideSecurity,
  requirements: SlideRequirements,
  cta:          SlideCTA,
};

/* Slide order, narration text and fallback pacing all come from src/demo/narration.ts,
   which is also what scripts/generate-voice.mjs renders to public/voice/<id>.mp3. */
const SLIDES = NARRATION.map(n => ({ ...n, Component: COMPONENTS[n.id] }));

export function DemoPage() {
  const [current, setCurrent]       = useState(0);
  const [direction, setDirection]   = useState(1);
  const [started, setStarted]       = useState(false);
  const [muted, setMuted]           = useState(false);
  const [paused, setPaused]         = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const { speak, cancel: cancelVoice, prime: primeVoice } = useVoice();

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
    cancelVoice();
  }, [cancelVoice]);

  const runSlide = useCallback((slideIndex: number) => {
    const gen = ++genRef.current;
    timerIds.current.forEach(id => { clearTimeout(id); clearInterval(id); });
    timerIds.current = [];
    cancelVoice();

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

    if (audioEnabledRef.current && !mutedRef.current) {
      // Voice drives the timing; 45s emergency cap only fires if speech hangs entirely
      const capId = window.setTimeout(advance, 45000) as unknown as number;
      timerIds.current.push(capId);
      speak(slide.id, () => {
        if (stale()) return;
        // Clips already carry ~260ms of tail silence, so this is just the turn beat
        const t = window.setTimeout(advance, 850) as unknown as number;
        timerIds.current.push(t);
      });
    } else {
      // No audio — use maxDuration to pace the slides
      const t = window.setTimeout(advance, slide.maxDuration) as unknown as number;
      timerIds.current.push(t);
    }
  }, [speak, cancelVoice]);

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

  /* "Get a Tour" â€” satisfies browser autoplay policy, starts tour + audio */
  const handleStart = useCallback(() => {
    primeVoice();
    setStarted(true);
    setAudioEnabled(true);
    setMuted(false);
  }, [primeVoice]);

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
  const volumeIcon  = muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />;
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

          {/* Top bar — 3-column grid so brand stays perfectly centred */}
          <div className="absolute top-0 left-0 right-0 grid grid-cols-3 items-start px-5 pt-3 pb-2">
            {/* Left: volume */}
            <div className="flex flex-col items-start">
              <button
                onClick={handleVolumeClick}
                className="p-3 rounded-full transition-all"
                style={{ color: muted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)' }}
                title={volumeTitle}
              >
                {volumeIcon}
              </button>
              <span className="text-[11px] font-mono tracking-widest pl-1 transition-colors" style={{ color: muted ? 'rgba(255,255,255,0.2)' : 'rgba(52,211,153,0.65)' }}>
                {muted ? 'TAP TO ENABLE' : 'AUDIO ON'}
              </span>
            </div>

            {/* Centre: Kaden brand — hidden on hero and CTA slides (they have their own large one) */}
            {current !== 0 && current !== SLIDES.length - 1 && (
              <div className="flex items-center justify-center gap-2 pt-3">
                <KadenBrandMark className="w-5 h-5" color="rgba(255,255,255,0.45)" gradientId="topbar-kb" />
                <span className="text-[11px] font-bold tracking-[0.18em] text-white/35" style={{ fontFamily: "'Michroma', sans-serif" }}>
                  KADEN AI
                </span>
              </div>
            )}
            {(current === 0 || current === SLIDES.length - 1) && <div />}

            {/* Right: slide counter + pause */}
            <div className="flex items-center justify-end gap-4 pt-1">
              <span className="text-sm font-mono text-white/35 tabular-nums">
                {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </span>
              <button
                onClick={togglePause}
                className="p-3 rounded-full text-white/45 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                title={paused ? 'Resume (Space)' : 'Pause (Space)'}
              >
                {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
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

