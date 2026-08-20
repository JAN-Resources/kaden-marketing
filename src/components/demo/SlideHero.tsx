import { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { KadenBrandMark } from '../KadenBrandMark';

interface Props { started: boolean; onStart: () => void }
type Particle = { x: number; y: number; vx: number; vy: number; r: number; opacity: number };

export function SlideHero({ started, onStart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const mobile = window.innerWidth < 640;
    const COUNT = mobile ? 20 : 55;
    const DIST  = mobile ? 70 : 130;
    const SPEED = mobile ? 0.2 : 0.45;
    let particles: Particle[] = [];
    let animId: number;

    const init = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: 0.8 + Math.random() * 1.4,
        opacity: 0.15 + Math.random() * 0.35,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
        for (const q of particles) {
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST && d > 0) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - d / DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    const obs = new ResizeObserver(init);
    obs.observe(canvas);
    return () => { cancelAnimationFrame(animId); obs.disconnect(); };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[60vh]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col items-center text-center gap-5 sm:gap-8 max-w-2xl px-4">
        <div className="animate-fade-up flex items-center gap-3">
          <KadenBrandMark size={36} color="white" gradientId="hero-kb" />
          <span className="text-3xl sm:text-5xl font-bold text-white leading-none"
            style={{ fontFamily: "'Michroma', sans-serif", letterSpacing: '0.04em' }}>
            KADEN AI
          </span>
        </div>

        <p className="animate-fade-up delay-200 text-xs sm:text-sm font-mono tracking-[0.25em] uppercase"
          style={{ color: '#4ade8099' }}>
          Always in spec · Always on
        </p>

        <p className="animate-fade-up delay-300 text-base sm:text-xl text-white/55 leading-relaxed max-w-sm sm:max-w-md">
          Autonomous H2S control for the modern gas field
        </p>

        {!started ? (
          <button onClick={onStart}
            className="animate-fade-up delay-500 mt-1 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-black font-bold text-sm transition-all hover:bg-white/90 hover:scale-105 active:scale-95 shadow-lg shadow-black/30">
            Get a Tour
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <p className="animate-fade-up delay-400 text-white/25 text-xs font-mono tracking-wider">
            Tap arrows or swipe to navigate
          </p>
        )}

        <div className="animate-fade-up delay-700 absolute bottom-4 sm:bottom-8">
          <img src={`${import.meta.env.BASE_URL}logo/janresources.png`} alt="Jan Resources"
            className="h-7 sm:h-9 object-contain opacity-35"
            style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
      </div>
    </div>
  );
}
