import { useEffect, useState } from 'react';

interface Props { started: boolean; onStart: () => void }

interface Tag { label: string; unit: string; base: number; noise: number; color: string }

const TAGS: Tag[] = [
  { label: 'Inlet H2S',  unit: 'ppm',     base: 42.3,  noise: 1.6,  color: 'rgba(255,255,255,0.9)' },
  { label: 'Outlet H2S', unit: 'ppm',     base: 3.1,   noise: 0.3,  color: 'rgba(255,255,255,0.7)' },
  { label: 'Gas Flow',   unit: 'MMscfd',  base: 12.74, noise: 0.10, color: 'rgba(255,255,255,0.6)' },
  { label: 'Dose Cmd',   unit: 'gal/day', base: 18.5,  noise: 0.25, color: 'rgba(255,255,255,0.5)' },
];

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const w = 140, h = 32;
  const pts = values.map((v, i) =>
    `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`
  ).join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SlideMonitoring(_props: Props) {
  const [values, setValues] = useState<number[][]>(TAGS.map(t => [t.base]));

  useEffect(() => {
    const id = setInterval(() => {
      setValues(prev => prev.map((hist, i) => {
        const t = TAGS[i];
        const last = hist[hist.length - 1];
        const next = Math.max(0.1, last + (Math.random() - 0.5) * t.noise * 2);
        return [...hist.slice(-16), next];
      }));
    }, 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-mono mb-5 animate-fade-up" style={{ background:'#4ade8015', border:'1px solid #4ade8040', color:'#4ade80' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background:'#4ade80' }} />
          Live - updating every second
        </div>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Real-time field data
        </h2>
        <p className="animate-fade-up delay-200 text-white/40 mt-3 text-base">
          Direct from your instruments — inlet, outlet, flow, dose command
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TAGS.map((tag, i) => (
          <div
            key={tag.label}
            className="glass px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-2 sm:gap-3 animate-fade-up"
            style={{ animationDelay: `${0.2 + i * 0.08}s` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider leading-none">{tag.label}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse-dot" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums leading-none" style={{ color: i === 1 ? '#4ade80' : 'rgba(255,255,255,0.85)' }}>
                {(values[i]?.[values[i].length - 1] ?? tag.base).toFixed(
                  tag.unit === 'MMscfd' ? 2 : 1
                )}
              </span>
              <span className="text-[10px] font-mono text-white/30">{tag.unit}</span>
            </div>
            <Sparkline values={values[i] ?? []} color={i === 1 ? '#4ade80' : i === 3 ? '#60a5fa' : tag.color} />
          </div>
        ))}
      </div>

      <p className="animate-fade-up delay-700 text-center text-white/15 text-[11px] font-mono tracking-widest">
        Numbers updating live above - this is what Kaden watches at every site
      </p>
    </div>
  );
}
