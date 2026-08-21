import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

type DosingMode = 'off' | 'shadow' | 'auto';
const MODES: DosingMode[] = ['off', 'shadow', 'auto'];
const MODE_CFG = {
  off:    { label: 'Off',    desc: 'Controller paused',              dot: 'rgba(255,255,255,0.2)',  text: 'rgba(255,255,255,0.3)' },
  shadow: { label: 'Shadow', desc: 'Calculating - not writing pump', dot: '#fbbf24',                text: '#fbbf24' },
  auto:   { label: 'Auto',   desc: 'Writing dose command to pump',   dot: '#4ade80',                text: '#4ade80' },
};

export function SlideDosing(_props: Props) {
  const [mode, setMode] = useState<DosingMode>('off');
  const [dose, setDose] = useState(0);
  const [flowPct, setFlowPct] = useState(0);
  useEffect(() => {
    const seq: DosingMode[] = ['off', 'shadow', 'auto', 'auto', 'auto'];
    let step = 0;
    const id = setInterval(() => {
      step = (step + 1) % seq.length;
      setMode(seq[step]);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setDose(mode === 'off' ? 0 : 18.4);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'auto') { setFlowPct(0); return; }
    let p = 0;
    const id = setInterval(() => {
      p = (p + 4) % 100;
      setFlowPct(p);
    }, 50);
    return () => clearInterval(id);
  }, [mode]);

  return (
    <div className="w-full max-w-5xl flex flex-col gap-7 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 mb-3">
          Autonomous dosing
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Kaden doses the tower.<br />
          <span style={{ color:'#4ade80' }}>Automatically.</span>
        </h2>
      </div>

      <div className="animate-fade-up delay-200 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch justify-center">
        {/* Mode selector */}
        <div className="glass p-5 sm:p-6 sm:w-72 flex flex-col gap-3 flex-shrink-0">
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">Controller mode</p>
          {MODES.map(m => {
            const cfg = MODE_CFG[m];
            const active = mode === m;
            return (
              <div
                key={m}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-400"
                style={{
                  borderColor: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    background: cfg.dot,
                    boxShadow: active && m !== 'off' ? `0 0 8px ${cfg.dot}` : 'none',
                  }}
                />
                <span className="text-sm font-semibold transition-colors duration-300" style={{ color: cfg.text }}>
                  {cfg.label}
                </span>
                {active && (
                  <span className="ml-auto text-[10px] font-mono text-white/35">{cfg.desc}</span>
                )}
              </div>
            );
          })}

          {mode === 'auto' && (
            <div className="mt-1 pt-2 border-t border-white/[0.06] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" style={{ color:'#4ade80' }} />
              <span className="text-[10px] font-mono" style={{ color:'#4ade80cc' }}>Writing {dose.toFixed(1)} gal/day to pump</span>
            </div>
          )}
        </div>

        {/* Pipe / flow animation */}
        <div className="flex flex-col items-center gap-2">
          {/* Tank */}
          <div className="glass-sm px-5 py-3 flex flex-col items-center gap-1.5 w-32">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">H2S Scavenger</div>
            <div className="w-full h-12 rounded-md border border-white/10 bg-white/[0.03] relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-white/12 transition-all duration-1000" style={{ height: '68%' }} />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" />
            </div>
            <span className="text-[9px] font-mono text-white/30">68% full</span>
          </div>

          {/* Flow pipe */}
          <div className="relative w-1 h-16 bg-white/[0.06] rounded-full overflow-hidden">
            {mode === 'auto' && (
              <div
                className="absolute left-0 right-0 h-5 bg-white/40 rounded-full"
                style={{ top: `${flowPct}%`, transition: 'none' }}
              />
            )}
          </div>

          {/* Pump label */}
          <div
            className="glass-sm px-4 py-2 text-center transition-all duration-500"
            style={{ borderColor: mode === 'auto' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)' }}
          >
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Pump</p>
            <p className="text-sm font-bold font-mono mt-0.5" style={{ color: mode === 'auto' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}>
              {mode === 'auto' ? `${dose.toFixed(1)} gal/d` : '—'}
            </p>
          </div>
        </div>

        {/* Calculation panel */}
        <div className="glass p-5 sm:p-6 sm:w-64 flex flex-col gap-2.5 flex-shrink-0">
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Calculation</p>
          {[
            { label: 'Inlet H2S',    value: '42.3 ppm'  },
            { label: 'Outlet H2S',   value: '3.1 ppm'   },
            { label: 'Gas flow',     value: '12.7 MMscfd'},
            { label: 'FF dose',      value: '16.8 gal/d' },
            { label: 'PID trim',     value: '+1.6 gal/d' },
            { label: 'Final dose',   value: `${dose.toFixed(1)} gal/d` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-white/30">{label}</span>
              <span className={`text-[10px] font-mono font-semibold`} style={{ color: label === 'Final dose' ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
