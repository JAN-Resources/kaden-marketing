import { useEffect, useState } from 'react';
import { Radio, Search, Activity, MapPin } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

/* ─── colour tokens matching real app dark mode ────────────────── */
const C = {
  surface:  '#111115',
  raised:   '#1c1c20',
  border:   'rgba(255,255,255,0.08)',
  borderSub:'rgba(255,255,255,0.05)',
  ink:      'rgba(255,255,255,0.88)',
  inkDim:   'rgba(255,255,255,0.42)',
  inkFaint: 'rgba(255,255,255,0.18)',
  accent:   '#34d399',          // emerald-400 — matches real app primary
  accentLo: 'rgba(52,211,153,0.25)',
  accentBg: 'rgba(52,211,153,0.08)',
};

/* ─── Tag definitions ───────────────────────────────────────────── */
interface Tag { label: string; unit: string; base: number; noise: number; digits: number }

const ALL_TAGS: Tag[] = [
  { label: 'Inlet H2S',           unit: 'ppm',      base: 42.3,  noise: 0.9,  digits: 1 }, // 0
  { label: 'Outlet H2S',          unit: 'ppm',      base: 3.1,   noise: 0.2,  digits: 1 }, // 1
  { label: 'Gas Flow',            unit: 'MMscfd',   base: 12.74, noise: 0.06, digits: 2 }, // 2
  { label: 'Dose Cmd',            unit: 'gal/day',  base: 18.4,  noise: 0.15, digits: 1 }, // 3
  { label: 'Tower Effic',         unit: '%',         base: 92.6,  noise: 0.3,  digits: 1 }, // 4
  { label: 'Sump Level',          unit: '%',         base: 44.2,  noise: 0.4,  digits: 1 }, // 5
  { label: 'Inlet Press',         unit: 'psig',      base: 18.3,  noise: 0.2,  digits: 1 }, // 6
  { label: 'Outlet Press',        unit: 'psig',      base: 17.6,  noise: 0.15, digits: 1 }, // 7
  { label: 'Battery Voltage',     unit: 'V',         base: 140.0, noise: 0.5,  digits: 1 }, // 8
  { label: 'Total Strokes',       unit: 'strokes',   base: 70,    noise: 1,    digits: 0 }, // 9
  { label: 'Chem Flow Today',     unit: 'gal',       base: 0.8,   noise: 0.05, digits: 1 }, // 10
  { label: 'Chem Flow Lifetime',  unit: 'gal',       base: 62.3,  noise: 0.2,  digits: 1 }, // 11
];

const LEFT_IDX  = [0, 2, 6, 5];
const RIGHT_IDX = [1, 3, 4, 7];

/* ─── LiveCallout card (mirrors real app diagramPrimitives.tsx) ── */
function LiveCallout({ tag, value, sAgo }: { tag: Tag; value: number; sAgo: number }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.accent}`,
      borderRadius: 8,
      padding: '8px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: C.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tag.label}
        </span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.accent, flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 15, fontWeight: 700, color: C.ink }}>
          {value.toFixed(tag.digits)}
        </span>
        {tag.unit && (
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: C.inkDim }}>{tag.unit}</span>
        )}
      </div>
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: C.inkFaint }}>
        {sAgo}s ago
      </span>
    </div>
  );
}

/* ─── Compact tag card for Live Channels panel ───────────────────  */
function CompactTag({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div style={{
      background: C.raised,
      border: `1px solid ${C.border}`,
      borderLeft: `2px solid ${C.accentLo}`,
      borderRadius: 6,
      padding: '6px 8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, color: C.inkDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
          {label}
        </span>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, flexShrink: 0 }} />
      </div>
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, fontWeight: 700, color: C.ink }}>
        {value}
      </span>
      {unit && (
        <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 9, color: C.inkDim, marginLeft: 3 }}>{unit}</span>
      )}
    </div>
  );
}

/* ─── Scrubber tower SVG (styled with real app's dark-mode palette) */
function ScrubberTower({ liquidY }: { liquidY: number }) {
  /* tower geometry — matches real ScrubberProcessArt viewBox 960×700 roughly */
  const tx = 418, tw = 124, tTop = 152, tBot = 520;
  const bed1Y = 192, bed1H = 100;
  const bed2Y = 325, bed2H = 100;
  const sumpY = 440 + liquidY * 3;

  /* skin gradient stops in dark mode (from diagramDefs.tsx) */
  const skinStops = [
    { o: '0%',   c: '#1a1a1e' },
    { o: '16%',  c: '#2a2a30' },
    { o: '42%',  c: '#3f3f46' },
    { o: '49%',  c: '#71717a' },
    { o: '60%',  c: '#27272a' },
    { o: '100%', c: '#121214' },
  ];

  const FLOW  = C.accent;
  const FAINT = 'rgba(52,211,153,0.35)';
  const STROKE= 'rgba(255,255,255,0.55)';
  const DIM   = 'rgba(255,255,255,0.22)';

  const pipeY = [378, 424, 470];

  return (
    <svg viewBox="290 68 380 578" className="w-full h-full" style={{ maxHeight: 440 }}>
      <defs>
        <style>{`
          @keyframes scrubDashFlow { to { stroke-dashoffset: -22; } }
          @keyframes scrubBub {
            0%   { transform:translateY(0);   opacity:0; }
            12%  { opacity:.8; }
            88%  { opacity:.5; }
            100% { transform:translateY(-72px); opacity:0; }
          }
          .sd-flow { animation: scrubDashFlow 1.1s linear infinite; }
          .sd-bub  { animation: scrubBub 2.8s ease-in infinite; }
        `}</style>

        <linearGradient id="sd-skinH" x1="0" y1="0" x2="1" y2="0">
          {skinStops.map(s => <stop key={s.o} offset={s.o} stopColor={s.c} />)}
        </linearGradient>

        <linearGradient id="sd-dome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0e0e12" />
          <stop offset="35%"  stopColor="#2e2e34" />
          <stop offset="55%"  stopColor="#4b4b52" />
          <stop offset="100%" stopColor="#101014" />
        </linearGradient>

        <linearGradient id="sd-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C.accent} stopOpacity="0.80" />
          <stop offset="55%"  stopColor="#059669"  stopOpacity="0.60" />
          <stop offset="100%" stopColor="#064e3b"  stopOpacity="0.45" />
        </linearGradient>

        <pattern id="sd-pack" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6,0 L12,3 L12,9 L6,12 L0,9 L0,3 Z"
            fill="none" stroke="rgba(52,211,153,0.45)" strokeWidth="0.9" />
          <circle cx="6" cy="6" r="1.4" fill="rgba(52,211,153,0.22)" />
        </pattern>

        <clipPath id="sd-clip">
          <rect x={tx + 1} y={tTop + 28} width={tw - 2} height={tBot - tTop - 28} />
        </clipPath>

        <marker id="sd-arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={FLOW} opacity="0.9" />
        </marker>

        <filter id="sd-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* ── Skirt + base (behind vessel) ── */}
      <path d={`M ${tx + 14},${tBot} L ${tx + 4},${tBot + 96} L ${tx + tw - 4},${tBot + 96} L ${tx + tw - 14},${tBot}`}
        fill="url(#sd-skinH)" stroke={DIM} strokeWidth="1.1" />
      {/* skirt openings */}
      <ellipse cx={tx + 34} cy={tBot + 62} rx="11" ry="16" fill="#0a0a0d" stroke={DIM} strokeWidth="1" />
      <ellipse cx={tx + tw - 34} cy={tBot + 62} rx="11" ry="16" fill="#0a0a0d" stroke={DIM} strokeWidth="1" />
      {/* base plate */}
      <rect x={tx - 10} y={tBot + 96} width={tw + 20} height={10} rx="1.5" fill="url(#sd-dome)" stroke={DIM} strokeWidth="1.1" />
      <line x1={tx - 18} y1={tBot + 108} x2={tx + tw + 18} y2={tBot + 108} stroke={DIM} strokeWidth="1.4" />
      {[tx - 12, tx + 2, tx + 18, tx + 34, tx + tw - 34, tx + tw - 18, tx + tw - 2, tx + tw + 12].map(x => (
        <line key={x} x1={x} y1={tBot + 108} x2={x - 10} y2={tBot + 120} stroke={FAINT} strokeWidth="1" />
      ))}

      {/* ── Gas inlet manifold (left) ── */}
      <rect x={tx - 54} y={pipeY[0] - 12} width="12" height={pipeY[2] - pipeY[0] + 24}
        fill="url(#sd-skinH)" stroke={DIM} strokeWidth="1" />
      <line x1={tx - 48} y1={pipeY[2] + 30} x2={tx - 48} y2={pipeY[2] + 10}
        stroke={FLOW} strokeWidth="1.5" markerEnd="url(#sd-arr)" className="sd-flow" />
      <text x={tx - 48} y={pipeY[2] + 46} textAnchor="middle"
        fontSize="11" fontFamily="ui-monospace,monospace" fill={FAINT} letterSpacing="1">GAS IN</text>
      {pipeY.map(y => (
        <g key={y}>
          <rect x={tx - 42} y={y - 7} width={42} height={14}
            fill="url(#sd-skinH)" stroke={DIM} strokeWidth="0.9" />
          <rect x={tx - 8} y={y - 11} width={7} height={22} rx="1"
            fill="url(#sd-dome)" stroke={DIM} strokeWidth="0.9" />
          <line x1={tx - 38} y1={y} x2={tx - 2} y2={y}
            stroke={FLOW} strokeWidth="1.5" strokeDasharray="7 5"
            className="sd-flow" markerEnd="url(#sd-arr)" />
        </g>
      ))}

      {/* ── Gas outlet manifold (right) ── */}
      <rect x={tx + tw + 42} y={pipeY[0] - 12} width="12" height={pipeY[2] - pipeY[0] + 24}
        fill="url(#sd-skinH)" stroke={DIM} strokeWidth="1" />
      <line x1={tx + tw + 48} y1={pipeY[2] + 10} x2={tx + tw + 48} y2={pipeY[2] + 30}
        stroke={FLOW} strokeWidth="1.5" markerEnd="url(#sd-arr)" className="sd-flow" />
      <text x={tx + tw + 48} y={pipeY[2] + 46} textAnchor="middle"
        fontSize="11" fontFamily="ui-monospace,monospace" fill={FAINT} letterSpacing="1">OUTLET</text>
      {pipeY.map(y => (
        <g key={y}>
          <rect x={tx + tw} y={y - 7} width={42} height={14}
            fill="url(#sd-skinH)" stroke={DIM} strokeWidth="0.9" />
          <rect x={tx + tw + 1} y={y - 11} width={7} height={22} rx="1"
            fill="url(#sd-dome)" stroke={DIM} strokeWidth="0.9" />
          <line x1={tx + tw + 2} y1={y} x2={tx + tw + 40} y2={y}
            stroke={FLOW} strokeWidth="1.5" strokeDasharray="7 5"
            className="sd-flow" markerEnd="url(#sd-arr)" />
        </g>
      ))}

      {/* ── Vessel body ── */}
      <g filter="url(#sd-shadow)">
        <path d={`M ${tx},${tBot} A ${tw / 2},38 0 0 0 ${tx + tw},${tBot} Z`}
          fill="url(#sd-dome)" />
        <rect x={tx} y={tTop + 28} width={tw} height={tBot - tTop - 28}
          fill="url(#sd-skinH)" />
        <path d={`M ${tx},${tTop + 28} A ${tw / 2},48 0 0 1 ${tx + tw},${tTop + 28} Z`}
          fill="url(#sd-dome)" />
      </g>
      {/* specular streak */}
      <rect x={tx + tw * 0.64} y={tTop + 30} width={tw * 0.06} height={tBot - tTop - 32}
        fill="rgba(255,255,255,0.07)" />

      {/* ── Internals (clipped) ── */}
      <g clipPath="url(#sd-clip)">
        {/* Sump liquid */}
        <rect x={tx + 1} y={sumpY} width={tw - 2} height={tBot - sumpY} fill="url(#sd-liquid)" />
        <line x1={tx + 1} y1={sumpY} x2={tx + tw - 1} y2={sumpY}
          stroke={C.accent} strokeWidth="1.8" opacity="0.9">
          <animate attributeName="y1" values={`${sumpY};${sumpY-3};${sumpY}`} dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" values={`${sumpY};${sumpY-3};${sumpY}`} dur="3s" repeatCount="indefinite" />
        </line>
        {[tx + tw * 0.22, tx + tw * 0.5, tx + tw * 0.78].map((cx, i) => (
          <circle key={i} cx={cx} cy={tBot - 20} r="3"
            fill={C.accent} className="sd-bub"
            style={{ animationDelay: `${i * 0.9}s` }} />
        ))}

        {/* Upper packing bed */}
        <rect x={tx + 1} y={bed1Y} width={tw - 2} height={bed1H} fill="url(#sd-pack)" />
        <rect x={tx + 1} y={bed1Y} width={tw - 2} height={bed1H} fill="rgba(52,211,153,0.08)" />

        {/* Lower packing bed */}
        <rect x={tx + 1} y={bed2Y} width={tw - 2} height={bed2H} fill="url(#sd-pack)" />
        <rect x={tx + 1} y={bed2Y} width={tw - 2} height={bed2H} fill="rgba(52,211,153,0.08)" />

        {/* Mist eliminator */}
        <rect x={tx + 1} y={tTop + 28} width={tw - 2} height={18}
          fill="url(#sd-pack)" opacity="0.6" />

        {/* Counter-current arrow */}
        <line x1={tx + tw / 2} y1={sumpY - 5} x2={tx + tw / 2} y2={tTop + 50}
          stroke={FAINT} strokeWidth="1.5" strokeDasharray="4 8"
          className="sd-flow" markerEnd="url(#sd-arr)" />
      </g>

      {/* ── Support grids ── */}
      <line x1={tx} y1={bed1Y + bed1H} x2={tx + tw} y2={bed1Y + bed1H}
        stroke={STROKE} strokeWidth="1.4" />
      <line x1={tx} y1={bed2Y + bed2H} x2={tx + tw} y2={bed2Y + bed2H}
        stroke={STROKE} strokeWidth="1.4" />

      {/* ── Liquid distributor ── */}
      <rect x={tx + tw * 0.18} y={bed1Y - 12} width={tw * 0.64} height={6}
        rx="2" fill="rgba(52,211,153,0.5)" stroke="rgba(52,211,153,0.7)" strokeWidth="0.9" />
      {[0.25, 0.38, 0.52, 0.66, 0.78].map(f => (
        <line key={f}
          x1={tx + tw * f} y1={bed1Y - 6}
          x2={tx + tw * f} y2={bed1Y}
          stroke={FLOW} strokeWidth="1.2" className="sd-flow" markerEnd="url(#sd-arr)" />
      ))}

      {/* ── Top nozzle ── */}
      <rect x={tx + tw / 2 - 12} y={tTop - 34} width={24} height={tTop - 10 - (tTop - 34)}
        fill="url(#sd-dome)" stroke={DIM} strokeWidth="1" />
      <rect x={tx + tw / 2 - 17} y={tTop - 36} width={34} height={8}
        rx="1.5" fill="url(#sd-dome)" stroke={DIM} strokeWidth="1" />
      <line x1={tx + tw / 2} y1={tTop - 38} x2={tx + tw / 2} y2={tTop - 50}
        stroke={FLOW} strokeWidth="1.8" className="sd-flow" markerEnd="url(#sd-arr)" />

      {/* ── Instrument taps ── */}
      {[194, 240, 286, 332].map(y => (
        <g key={y}>
          <rect x={tx - 8} y={y - 4} width={7} height={8}
            rx="0.5" fill="#1a1a1e" stroke={DIM} strokeWidth="0.8" />
          <rect x={tx + tw + 1} y={y - 4} width={7} height={8}
            rx="0.5" fill="#1a1a1e" stroke={DIM} strokeWidth="0.8" />
        </g>
      ))}

      {/* ── Text labels ── */}
      <text x={tx + tw / 2} y={tTop - 58} textAnchor="middle"
        fontSize="17" fontFamily="ui-monospace,monospace" fontWeight="700" letterSpacing="4"
        fill="rgba(255,255,255,0.75)">H₂S SCRUBBER</text>
      <text x={tx + tw / 2} y={tTop - 38} textAnchor="middle"
        fontSize="10.5" fontFamily="ui-monospace,monospace" letterSpacing="3.5"
        fill={C.inkDim}>PACKED ABSORBER · T-114</text>
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export function SlideDashboard(_props: Props) {
  const [hists, setHists] = useState<number[][]>(ALL_TAGS.map(t => [t.base]));
  const [liquidY, setLiquidY] = useState(0);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHists(prev => prev.map((h, i) => {
        const t = ALL_TAGS[i];
        const last = h[h.length - 1];
        const next = Math.max(0.01, last + (Math.random() - 0.5) * t.noise * 2);
        return [...h.slice(-12), next];
      }));
      setLiquidY(y => (y + 1) % 5);
      setTick(t => t + 1);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const val  = (i: number) => hists[i]?.[hists[i].length - 1] ?? ALL_TAGS[i].base;
  const fmt  = (i: number) => val(i).toFixed(ALL_TAGS[i].digits);
  const eff  = Math.round(val(4));
  const sAgo = tick % 8;

  const channelGroups = [
    { label: 'PUMP STATUS', count: '5 ch', tags: [
      { label: 'Battery Voltage',   value: fmt(8),  unit: 'V'       },
      { label: 'Total Strokes',     value: fmt(9),  unit: 'strokes' },
      { label: 'Running Status',    value: '1.0',   unit: ''        },
      { label: 'Alarm Status',      value: '0',     unit: ''        },
      { label: 'Pump On/Off',       value: '1',     unit: ''        },
    ]},
    { label: 'CHEM FLOW', count: '2 ch', tags: [
      { label: 'Chem Flow Today',    value: fmt(10), unit: 'gal' },
      { label: 'Chem Flow Lifetime', value: fmt(11), unit: 'gal' },
    ]},
    { label: 'DOSING', count: '4 ch', tags: [
      { label: 'Dose Rate',     value: fmt(3),  unit: 'gal/day' },
      { label: 'Control Mode', value: '3.0',   unit: ''        },
      { label: 'Max Head Cap', value: '362.0', unit: ''        },
      { label: 'Tank Level In',value: fmt(5),  unit: '%'       },
    ]},
  ];

  /* ── shared card style ── */
  const card: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    overflow: 'hidden',
  };

  return (
    <div className="w-full max-w-[1280px] flex flex-col gap-2 px-2 py-1 animate-fade-up"
      style={{ maxHeight: '96vh' }}>

      {/* ── Site banner (mirrors SiteDetailPage header) ── */}
      <div style={{ ...card, position: 'relative', padding: '10px 16px' }}>
        {/* top accent line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
          background:'linear-gradient(90deg,transparent,rgba(52,211,153,0.35),transparent)' }} />
        {/* grid overlay */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.03,
          backgroundImage:'linear-gradient(rgba(6,182,212,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.5) 1px,transparent 1px)',
          backgroundSize:'32px 32px' }} />

        <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <Radio size={15} color={C.accent} />
              <span style={{ fontSize:19, fontWeight:700, color:C.ink, letterSpacing:'-0.01em' }}>
                Jan Field Test 2
              </span>
              {/* ONLINE badge */}
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 8px',
                borderRadius:99, fontSize:10, fontWeight:700, letterSpacing:'0.12em',
                border:`1px solid rgba(52,211,153,0.4)`,
                color: C.accent, background: C.accentBg }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:C.accent,
                  animation:'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                ONLINE
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, fontFamily:'ui-monospace,monospace', color:C.inkDim }}>
                <MapPin size={11} />
                Odessa
              </span>
              <span style={{ fontSize:12, fontFamily:'ui-monospace,monospace', color:C.inkDim }}>
                31.88, -102.38
              </span>
              <span style={{ fontSize:12, fontFamily:'ui-monospace,monospace', color:C.ink }}>Auto</span>
            </div>
          </div>
          <span style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkFaint, marginTop:2 }}>
            Updated {sAgo}s ago
          </span>
        </div>
      </div>

      {/* ── KPI tiles (2×2 mobile → 4×1 desktop) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

        {/* System Status */}
        <div style={{ background:'rgba(5,46,22,0.3)', border:`1px solid rgba(52,211,153,0.22)`,
          borderRadius:12, padding:'10px 14px' }}>
          <p style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkDim, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
            System Status
          </p>
          <p style={{ fontSize:18, fontWeight:700, color:C.accent, letterSpacing:'0.02em', marginBottom:3 }}>
            Online
          </p>
          <p style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkDim }}>
            All channels nominal
          </p>
        </div>

        {/* Tower Efficiency — matches real app's gradient bar exactly */}
        <div style={{ ...card, padding:'10px 14px' }}>
          <p style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkDim, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
            Tower Efficiency
          </p>
          <p style={{ fontSize:18, fontWeight:700, color:'#22d3ee', marginBottom:6 }}>
            {eff}%
          </p>
          <div style={{ position:'relative', height:10, borderRadius:99, overflow:'hidden', background:'rgba(255,255,255,0.07)' }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,#64748b,#3b82f6,#22d3ee)', opacity:0.15 }} />
            <div style={{ position:'absolute', top:0, left:0, height:'100%', borderRadius:99,
              background:'linear-gradient(to right,#64748b,#3b82f6,#22d3ee)',
              transition:'width 0.7s', width:`${eff}%` }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
            <span style={{ fontSize:9, fontFamily:'ui-monospace,monospace', color:'#94a3b8' }}>0</span>
            <span style={{ fontSize:9, fontFamily:'ui-monospace,monospace', color:'#60a5fa' }}>50%</span>
            <span style={{ fontSize:9, fontFamily:'ui-monospace,monospace', color:'#22d3ee' }}>100</span>
          </div>
        </div>

        {/* Active Alarms */}
        <div style={{ ...card, padding:'10px 14px' }}>
          <p style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkDim, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
            Active Alarms
          </p>
          <p style={{ fontSize:18, fontWeight:700, color:C.inkDim, marginBottom:3 }}>0</p>
          <p style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkDim }}>All within limits</p>
        </div>

        {/* Signal Quality */}
        <div style={{ ...card, padding:'10px 14px' }}>
          <p style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkDim, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
            Signal Quality
          </p>
          <p style={{ fontSize:18, fontWeight:700, color:C.accent, marginBottom:6 }}>100%</p>
          <div style={{ height:4, borderRadius:99, overflow:'hidden', background:'rgba(255,255,255,0.07)', marginBottom:3 }}>
            <div style={{ height:'100%', width:'100%', borderRadius:99, background:C.accent }} />
          </div>
          <p style={{ fontSize:9, fontFamily:'ui-monospace,monospace', color:C.inkDim }}>
            11 / 11 channels good
          </p>
        </div>
      </div>

      {/* ── Main section ── */}
      <div className="flex gap-2 flex-1 min-h-0" style={{ minHeight:0 }}>

        {/* ── Process View ── */}
        <div style={{ ...card, flex:3, display:'flex', flexDirection:'column', minHeight:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 16px', borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontFamily:'ui-monospace,monospace', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:C.inkDim }}>
              Process View
            </span>
            <span style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkFaint }}>
              click callout to chart
            </span>
          </div>

          <div style={{ padding:8, flex:1, display:'flex', alignItems:'stretch', minHeight:0 }}>

            {/* Mobile: 2-col callout grid */}
            <div className="sm:hidden grid grid-cols-2 gap-2 w-full">
              {[...LEFT_IDX, ...RIGHT_IDX].map(i => (
                <LiveCallout key={i} tag={ALL_TAGS[i]} value={val(i)} sAgo={sAgo} />
              ))}
            </div>

            {/* Desktop: left callouts | scrubber | right callouts */}
            <div className="hidden sm:flex w-full items-center gap-2">
              <div style={{ width:128, flexShrink:0, display:'flex', flexDirection:'column', gap:5, justifyContent:'space-around', height:'100%' }}>
                {LEFT_IDX.map(i => (
                  <LiveCallout key={i} tag={ALL_TAGS[i]} value={val(i)} sAgo={sAgo} />
                ))}
              </div>

              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:0, minWidth:0 }}>
                <ScrubberTower liquidY={liquidY} />
              </div>

              <div style={{ width:128, flexShrink:0, display:'flex', flexDirection:'column', gap:5, justifyContent:'space-around', height:'100%' }}>
                {RIGHT_IDX.map(i => (
                  <LiveCallout key={i} tag={ALL_TAGS[i]} value={val(i)} sAgo={sAgo} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Live Channels (hidden on mobile) ── */}
        <div className="hidden sm:flex flex-col" style={{ ...card, width:210, flexShrink:0, overflow:'hidden' }}>
          <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
            padding:'10px 14px 8px', borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontFamily:'ui-monospace,monospace', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase',
              color:C.inkDim, display:'flex', alignItems:'center', gap:6 }}>
              <Activity size={13} color={C.accentLo} />
              Live Channels
            </span>
            <span style={{ fontSize:10, fontFamily:'ui-monospace,monospace', color:C.inkFaint }}>tap to chart</span>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:10, display:'flex', flexDirection:'column', gap:10 }}>
            {/* filter */}
            <div style={{ display:'flex', alignItems:'center', gap:6,
              background:C.raised, border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 10px' }}>
              <Search size={11} color={C.inkDim} />
              <span style={{ fontSize:11, fontFamily:'ui-monospace,monospace', color:C.inkFaint }}>Filter tags…</span>
            </div>

            {channelGroups.map(group => (
              <div key={group.label} style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6,
                  borderLeft:`3px solid rgba(52,211,153,0.35)`, paddingLeft:8 }}>
                  <span style={{ fontSize:10, fontFamily:'ui-monospace,monospace', fontWeight:600,
                    color:C.inkDim, textTransform:'uppercase', letterSpacing:'0.12em' }}>
                    {group.label}
                  </span>
                  <span style={{ fontSize:9, fontFamily:'ui-monospace,monospace', color:C.inkFaint }}>
                    {group.count}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                  {group.tags.map(t => (
                    <CompactTag key={t.label} label={t.label} value={t.value} unit={t.unit} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
