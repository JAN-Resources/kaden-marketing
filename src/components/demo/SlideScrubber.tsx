import { useEffect, useState } from 'react';

interface Props { started: boolean; onStart: () => void }

/* Animated standalone scrubber tower SVG — matches the monochrome aesthetic
   of the real ScrubberTowerDiagram used in the dashboard. */
export function SlideScrubber(_props: Props) {
  const [liquidY, setLiquidY] = useState(0);
  const [inletPpm, setInletPpm] = useState(42.1);
  const [outletPpm, setOutletPpm] = useState(3.1);

  useEffect(() => {
    const id = setInterval(() => {
      setLiquidY(prev => (prev + 1) % 6);
      setInletPpm(v => +(Math.max(38, Math.min(48, v + (Math.random() - 0.5) * 1.2)).toFixed(1)));
      setOutletPpm(v => +(Math.max(2.0, Math.min(4.5, v + (Math.random() - 0.5) * 0.3)).toFixed(1)));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-5xl flex flex-col gap-5 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 mb-3">
          Process diagram
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Your tower, <span style={{ color:'#4ade80' }}>fully instrumented</span>
        </h2>
      </div>

      <div className="animate-fade-up delay-200 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch justify-center">
        {/* SVG Tower */}
        <div className="glass overflow-hidden flex-shrink-0 sm:w-72" style={{ padding: '12px' }}>
          <svg viewBox="0 0 240 420" className="w-full mx-auto" style={{ maxHeight: 260, maxWidth: 200 }}>
            <defs>
              <style>{`
                @keyframes dashFlow { to { stroke-dashoffset: -26; } }
                @keyframes bubbleRise {
                  0%   { transform: translateY(0); opacity: 0; }
                  8%   { opacity: 0.55; }
                  90%  { opacity: 0.35; }
                  100% { transform: translateY(-70px); opacity: 0; }
                }
                .dash-flow { animation: dashFlow 1.2s linear infinite; }
                .dash-flow-slow { animation: dashFlow 1.8s linear infinite; }
                .bubble { animation: bubbleRise 3.2s ease-in infinite; }
              `}</style>
              {/* Vertical gradient for tower body */}
              <linearGradient id="towerBody" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.05)" />
                <stop offset="40%"  stopColor="rgba(255,255,255,0.12)" />
                <stop offset="70%"  stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
              </linearGradient>
              {/* Liquid sump gradient */}
              <linearGradient id="sumpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
              </linearGradient>
              <clipPath id="towerClip">
                <rect x="81" y="38" width="78" height="300" />
              </clipPath>
              <marker id="arrowW" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="rgba(255,255,255,0.4)" />
              </marker>
            </defs>

            {/* ── Skirt / base ── */}
            <path d="M 97,338 L 90,390 L 150,390 L 143,338 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <rect x="82" y="390" width="76" height="5" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
            {[86,96,106,116,126,136,146,156].map(x => (
              <line key={x} x1={x} y1="396" x2={x-7} y2="406" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            ))}

            {/* ── Gas inlet manifold (left) ── */}
            <rect x="24" y="220" width="8" height="80" fill="url(#towerBody)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="28" y="316" textAnchor="middle" fontSize="8" fontFamily="ui-monospace,monospace" fill="rgba(255,255,255,0.3)" letterSpacing="1">GAS IN</text>
            {[235, 260, 285].map(y => (
              <g key={y}>
                <rect x="32" y={y-4} width="49" height="8" fill="url(#towerBody)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                <line x1="33" y1={y} x2="74" y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="5 4" className="dash-flow" markerEnd="url(#arrowW)" />
              </g>
            ))}

            {/* ── Treated outlet manifold (right) ── */}
            <rect x="208" y="220" width="8" height="80" fill="url(#towerBody)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="212" y="316" textAnchor="middle" fontSize="8" fontFamily="ui-monospace,monospace" fill="rgba(255,255,255,0.3)" letterSpacing="1">OUT</text>
            {[235, 260, 285].map(y => (
              <g key={y}>
                <rect x="159" y={y-4} width="49" height="8" fill="url(#towerBody)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                <line x1="166" y1={y} x2="207" y2={y} stroke="rgba(255,255,255,0.20)" strokeWidth="1.2" strokeDasharray="5 4" className="dash-flow" markerEnd="url(#arrowW)" />
              </g>
            ))}

            {/* ── Vessel body ── */}
            <path d="M 82,38 A 39,26 0 0 1 158,38 Z" fill="url(#towerBody)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" />
            <rect x="82" y="38" width="76" height="300" fill="url(#towerBody)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4">
              <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="3.2s" repeatCount="indefinite" />
            </rect>
            <path d="M 82,338 A 39,22 0 0 0 158,338 Z" fill="url(#towerBody)" stroke="rgba(255,255,255,0.20)" strokeWidth="1.2" />

            {/* Glass specular streak */}
            <rect x="116" y="42" width="4" height="294" fill="rgba(255,255,255,0.07)" />

            {/* ── Internals (clipped) ── */}
            <g clipPath="url(#towerClip)">
              {/* Sump liquid */}
              <rect x="83" y={285 + liquidY} width="74" height="52" fill="url(#sumpGrad)" />
              <line x1="83" y1={285 + liquidY} x2="157" y2={285 + liquidY} stroke="rgba(255,255,255,0.22)" strokeWidth="1.2">
                <animate attributeName="y1" values={`${285+liquidY};${282+liquidY};${285+liquidY}`} dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="y2" values={`${285+liquidY};${282+liquidY};${285+liquidY}`} dur="3.5s" repeatCount="indefinite" />
              </line>

              {/* Bubbles in sump */}
              {[100, 118, 135, 150].map((x, i) => (
                <circle key={x} cx={x} cy={310} r={1.8} fill="rgba(255,255,255,0.3)" className="bubble" style={{ animationDelay: `${i * 0.7}s`, animationDuration: `${2.8 + i * 0.4}s` }} />
              ))}

              {/* Mist eliminator */}
              <rect x="83" y="42" width="74" height="12" fill="rgba(255,255,255,0.08)" opacity="0.7" />

              {/* Counter-current gas flow arrow */}
              <line x1="120" y1="280" x2="120" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeDasharray="3 7" markerEnd="url(#arrowW)" className="dash-flow-slow" />
            </g>

            {/* Sump boundary */}
            <line x1="83" y1="284" x2="157" y2="284" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeOpacity="0.7" />

            {/* Liquid distributor + nozzles */}
            <rect x="95" y="72" width="50" height="5" rx="2" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.20)" strokeWidth="0.8" />
            {[100, 110, 120, 130, 140].map(x => (
              <line key={x} x1={x} y1="77" x2={x} y2="86" stroke="rgba(255,255,255,0.25)" strokeWidth="1.1" className="dash-flow" markerEnd="url(#arrowW)" />
            ))}

            {/* Top outlet nozzle */}
            <rect x="109" y="14" width="22" height="24" fill="url(#towerBody)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <rect x="104" y="10" width="32" height="5" rx="1" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <line x1="120" y1="10" x2="120" y2="0" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" className="dash-flow" markerEnd="url(#arrowW)" />
            <circle cx="120" cy="2" r="2.5" fill="rgba(255,255,255,0.18)">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.2s" repeatCount="indefinite" />
            </circle>

            {/* Instrument taps */}
            {[110, 155, 195, 245].map(y => (
              <g key={y}>
                <rect x="75" y={y-3} width="6" height="6" rx="0.5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
                <rect x="159" y={y-3} width="6" height="6" rx="0.5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
              </g>
            ))}
          </svg>
        </div>

        {/* Tag readouts */}
        <div className="flex flex-col gap-2 sm:gap-3 flex-1 sm:max-w-xs justify-center">
          {[
            { label: 'Inlet H2S',    value: `${inletPpm} ppm`,    sub: 'raw gas inlet',      side: 'left'  },
            { label: 'Outlet H2S',   value: `${outletPpm} ppm`,   sub: 'treated gas outlet', side: 'right' },
            { label: 'Tank level',   value: '42%',                 sub: 'fresh scavenger',    side: 'left'  },
          ].map(({ label, value, sub }, i) => (
            <div
              key={label}
              className="glass px-4 py-3.5 flex justify-between items-center animate-fade-up"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div>
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-wider">{label}</p>
                <p className="text-xs text-white/30 mt-0.5">{sub}</p>
              </div>
              <span className="text-base font-bold font-mono text-white/80">{value}</span>
            </div>
          ))}

          <div className="animate-fade-up delay-800 glass px-4 py-2.5 flex items-center gap-2" style={{ borderColor:'#4ade8030' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot flex-shrink-0" style={{ background:'#4ade80' }} />
            <span className="text-xs font-mono" style={{ color:'#4ade80cc' }}>All zones nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
