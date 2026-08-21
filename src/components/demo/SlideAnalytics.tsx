import { TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const WEEK = [
  { day: 'Mon', eff: 72,  dose: 128, h2sIn: 44, h2sOut: 4.1 },
  { day: 'Tue', eff: 79,  dose: 121, h2sIn: 48, h2sOut: 3.4 },
  { day: 'Wed', eff: 85,  dose: 114, h2sIn: 51, h2sOut: 2.7 },
  { day: 'Thu', eff: 88,  dose: 110, h2sIn: 49, h2sOut: 2.4 },
  { day: 'Fri', eff: 93,  dose: 105, h2sIn: 55, h2sOut: 1.9 },
  { day: 'Sat', eff: 95,  dose: 102, h2sIn: 53, h2sOut: 1.7 },
  { day: 'Sun', eff: 97,  dose: 98,  h2sIn: 58, h2sOut: 1.4 },
];

// ── SVG chart helpers ────────────────────────────────────────────────────────
const W = 420, H = 110;
const P = { t: 8, r: 10, b: 22, l: 34 };
const cW = W - P.l - P.r;
const cH = H - P.t - P.b;

function norm(v: number, lo: number, hi: number) { return (v - lo) / (hi - lo); }

function toPts(vals: number[], lo: number, hi: number) {
  return vals.map((v, i) => ({
    x: +(P.l + (i / (vals.length - 1)) * cW).toFixed(1),
    y: +(P.t + (1 - norm(v, lo, hi)) * cH).toFixed(1),
  }));
}

function curvePath(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = ((pts[i - 1].x + pts[i].x) / 2).toFixed(1);
    d += ` C ${cx} ${pts[i-1].y} ${cx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

function areaPath(pts: { x: number; y: number }[]) {
  const bottom = (P.t + cH).toFixed(1);
  return `${curvePath(pts)} L ${pts[pts.length-1].x} ${bottom} L ${P.l} ${bottom} Z`;
}

const effPts  = toPts(WEEK.map(d => d.eff),  60, 100);
const dosePts = toPts(WEEK.map(d => d.dose), 90, 135);

// Mini H2S chart (same helper, smaller canvas)
const MH = 60, MW = 160;
const MP = { t: 6, r: 6, b: 16, l: 6 };
const h2sInPts  = WEEK.map((d, i) => ({
  x: +(MP.l + (i / (WEEK.length - 1)) * (MW - MP.l - MP.r)).toFixed(1),
  y: +(MP.t + (1 - norm(d.h2sIn,  0, 70)) * (MH - MP.t - MP.b)).toFixed(1),
}));
const h2sOutPts = WEEK.map((d, i) => ({
  x: +(MP.l + (i / (WEEK.length - 1)) * (MW - MP.l - MP.r)).toFixed(1),
  y: +(MP.t + (1 - norm(d.h2sOut, 0, 70)) * (MH - MP.t - MP.b)).toFixed(1),
}));

// Gridlines at 0%, 33%, 66%, 100% of chart height
const GRIDS = [0, 0.33, 0.66, 1].map(f => +(P.t + f * cH).toFixed(1));
const GRID_LABELS = ['100%', '87%', '73%', '60%'];

export function SlideAnalytics(_props: Props) {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-5 px-6">
      {/* Header */}
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase mb-3" style={{ color: '#60a5fa80' }}>
          Weekly analytics
        </p>
        <h2 className="animate-fade-up delay-100 text-3xl sm:text-4xl font-bold text-white leading-tight">
          Your performance report.<br />
          <span style={{ color: '#60a5fa' }}>Already written.</span>
        </h2>
      </div>

      <div className="animate-fade-up delay-200 glass p-4 sm:p-5 flex flex-col gap-4">
        {/* Report header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white/70">Weekly Performance Report</p>
            <p className="text-[10px] font-mono text-white/25 mt-0.5">Week of Aug 18, 2026 · janfieldtest2</p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/20">
            <Clock className="w-3 h-3" />
            Auto-generated Mon 06:00
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Tower efficiency', value: '89.4%',  delta: '+25% this week',  up: true,  accent: '#4ade80' },
            { label: 'Chemical saved',   value: '30 gal', delta: 'vs prev week',    up: true,  accent: '#34d399' },
            { label: 'H2S compliance',   value: '99.8%',  delta: '+0.4% vs target', up: true,  accent: '#a78bfa' },
            { label: 'Uptime',           value: '100%',   delta: '7 of 7 days',     up: true,  accent: '#60a5fa' },
          ].map(({ label, value, delta, up, accent }) => (
            <div key={label} className="glass-sm px-3.5 py-3 flex flex-col gap-1" style={{ borderLeft: `2px solid ${accent}30` }}>
              <span className="text-[9px] font-mono uppercase tracking-wide text-white/35">{label}</span>
              <span className="text-xl font-bold tabular-nums" style={{ color: accent }}>{value}</span>
              <div className="flex items-center gap-1">
                {up ? <TrendingUp className="w-3 h-3" style={{ color: accent }} /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className="text-[9px] font-mono text-white/30">{delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="flex gap-4 items-start">

          {/* Main dual-line area chart */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">
              Efficiency vs Chemical dose — daily trend
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
              <defs>
                <linearGradient id="eff-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="dose-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {GRIDS.map((y, i) => (
                <g key={i}>
                  <line x1={P.l} y1={y} x2={W - P.r} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <text x={P.l - 4} y={y + 3.5} textAnchor="end" fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="ui-monospace,monospace">
                    {GRID_LABELS[i]}
                  </text>
                </g>
              ))}

              {/* Dose area (behind efficiency) */}
              <path d={areaPath(dosePts)} fill="url(#dose-fill)" />
              <path d={curvePath(dosePts)} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 3" />

              {/* Efficiency area */}
              <path d={areaPath(effPts)} fill="url(#eff-fill)" />
              <path d={curvePath(effPts)} fill="none" stroke="#4ade80" strokeWidth="2" />

              {/* Efficiency data points */}
              {effPts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3" fill="#111115" stroke="#4ade80" strokeWidth="1.5" />
                  {i === effPts.length - 1 && (
                    <text x={p.x + 5} y={p.y + 3} fontSize="8" fill="#4ade80" fontFamily="ui-monospace,monospace" fontWeight="700">
                      97%
                    </text>
                  )}
                </g>
              ))}

              {/* Day labels */}
              {WEEK.map((d, i) => (
                <text
                  key={d.day}
                  x={P.l + (i / (WEEK.length - 1)) * cW}
                  y={H - 4}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill="rgba(255,255,255,0.25)"
                  fontFamily="ui-monospace,monospace"
                >
                  {d.day}
                </text>
              ))}
            </svg>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 rounded-full" style={{ background: '#4ade80' }} />
                <span className="text-[8px] font-mono text-white/30">Tower efficiency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.6" /></svg>
                <span className="text-[8px] font-mono text-white/30">Chemical dose</span>
              </div>
            </div>
          </div>

          {/* Right: H2S reduction mini chart + compliance badge */}
          <div className="flex flex-col gap-3" style={{ width: 180, flexShrink: 0 }}>
            <div className="glass-sm p-3 flex flex-col gap-2">
              <p className="text-[9px] font-mono text-white/25 uppercase tracking-wider">H2S Reduction</p>
              <svg viewBox={`0 0 ${MW} ${MH}`} className="w-full" style={{ height: 60 }}>
                <defs>
                  <linearGradient id="h2sin-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f87171" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f87171" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="h2sout-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={areaPath(h2sInPts)}  fill="url(#h2sin-fill)" />
                <path d={curvePath(h2sInPts)} fill="none" stroke="#f87171" strokeWidth="1.5" strokeOpacity="0.7" />
                <path d={areaPath(h2sOutPts)}  fill="url(#h2sout-fill)" />
                <path d={curvePath(h2sOutPts)} fill="none" stroke="#4ade80" strokeWidth="1.5" />
              </svg>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-0.5 rounded" style={{ background: '#f87171bb' }} />
                  <span className="text-[8px] font-mono text-white/25">Inlet</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-0.5 rounded" style={{ background: '#4ade80' }} />
                  <span className="text-[8px] font-mono text-white/25">Outlet</span>
                </div>
              </div>
            </div>

            <div className="glass-sm p-3 flex flex-col gap-1.5" style={{ borderLeft: '2px solid rgba(52,211,153,0.3)' }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />
              <p className="text-white/70 text-xs font-semibold">96.8% avg<br />H2S reduction</p>
              <p className="text-[9px] font-mono text-white/25">Inlet 51 ppm → Outlet 2.5 ppm</p>
            </div>
          </div>

        </div>
      </div>

      <p className="animate-fade-up delay-700 text-center text-white/20 text-[10px] font-mono">
        Delivered to your inbox automatically - no manual work required
      </p>
    </div>
  );
}
