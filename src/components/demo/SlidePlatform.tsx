import { Globe, Radio, Cpu } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const SITES = [
  { x: 22, y: 38 }, { x: 30, y: 55 }, { x: 48, y: 32 }, { x: 52, y: 48 },
  { x: 58, y: 28 }, { x: 63, y: 42 }, { x: 71, y: 55 }, { x: 78, y: 35 },
  { x: 18, y: 62 }, { x: 85, y: 48 }, { x: 40, y: 65 }, { x: 68, y: 22 },
];

const FEATURES = [
  { icon: Globe,  label: 'Any location',  desc: 'Remote, onshore, offshore - if there\'s a cellular signal, Kaden connects.' },
  { icon: Radio,  label: 'Live data',     desc: 'Reads directly from your field instruments via Modbus every few seconds.' },
  { icon: Cpu,    label: 'Always on',     desc: 'Runs continuously in the cloud. No local hardware or PC needed on-site.' },
];

export function SlidePlatform(_props: Props) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-7 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 mb-4">
          The Kaden platform
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Every site. Anywhere.<br />24 / 7.
        </h2>
      </div>

      {/* World map dot grid */}
      <div className="animate-fade-up delay-200 relative w-full glass overflow-hidden" style={{ aspectRatio: '3/1', maxHeight: '160px' }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {SITES.map((s, i) => (
          <span
            key={i}
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)' }}
          >
            <span
              className="absolute w-6 h-6 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s`, animationDuration: '2.8s', top: '-12px', left: '-12px', border:'1px solid #4ade8040' }}
            />
            <span className="block w-2 h-2 rounded-full" style={{ background:'#4ade80' }} />
          </span>
        ))}

        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[10px] font-mono" style={{ color:'#4ade8090' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background:'#4ade80' }} />
          {SITES.length} sites online
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, label, desc }, i) => (
          <div
            key={label}
            className="glass-sm px-5 py-4 flex gap-4 items-start animate-fade-up"
            style={{ animationDelay: `${0.3 + i * 0.12}s` }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <p className="font-bold text-white/85 text-base">{label}</p>
              <p className="text-white/40 text-sm leading-relaxed mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
