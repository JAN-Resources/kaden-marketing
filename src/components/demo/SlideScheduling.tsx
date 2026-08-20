import { CalendarCheck, Package, Wrench, Droplets, AlertTriangle, ChevronRight } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const GREEN  = '#4ade80';
const AMBER  = '#fbbf24';
const BLUE   = '#60a5fa';

/* Upcoming schedule items */
const EVENTS = [
  {
    icon:  Droplets,
    label: 'Triazene Tank 1 - Refill',
    date:  'Aug 26',
    daysOut: 6,
    tagColor: AMBER,
    site:  'janfieldtest2',
  },
  {
    icon:  CalendarCheck,
    label: 'Quarterly Tower Inspection',
    date:  'Sep 5',
    daysOut: 16,
    tagColor: GREEN,
    site:  'janfieldtest2',
  },
  {
    icon:  Wrench,
    label: 'Pump Diaphragm Service',
    date:  'Sep 18',
    daysOut: 29,
    tagColor: GREEN,
    site:  'jansite3',
  },
  {
    icon:  Package,
    label: 'Annual Pressure Cert',
    date:  'Nov 1',
    daysOut: 73,
    tagColor: BLUE,
    site:  'janfieldtest2',
  },
];

/* Simple predicted tank level curve - SVG path */
function TankCurve() {
  const w = 320, h = 120;
  /* Declining curve: full at left, hits ~15% at right edge (refill needed) */
  const pts: [number, number][] = [
    [0, 20], [40, 28], [80, 40], [120, 56], [160, 70], [200, 84], [240, 96], [280, 106], [320, 112],
  ];
  const refillX = 260; // "Aug 26"

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 130 }}>
      <defs>
        <linearGradient id="sched-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={AMBER} stopOpacity="0.18" />
          <stop offset="100%" stopColor={AMBER} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="sched-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor={GREEN} />
          <stop offset="75%" stopColor={AMBER} />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
      </defs>

      {/* Fill under curve */}
      <polygon
        points={`0,${h} ${polyline} ${w},${h}`}
        fill="url(#sched-fill)"
      />

      {/* Curve line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="url(#sched-line)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Refill marker vertical line */}
      <line x1={refillX} y1="8" x2={refillX} y2={h - 4}
        stroke={AMBER} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />

      {/* Refill date label */}
      <text x={refillX + 5} y="20" fontSize="9" fontFamily="ui-monospace,monospace"
        fill={AMBER} opacity="0.9">Refill by Aug 26</text>

      {/* Min threshold line */}
      <line x1="0" y1={h - 14} x2={w} y2={h - 14}
        stroke="#f87171" strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />
      <text x="4" y={h - 17} fontSize="8" fontFamily="ui-monospace,monospace" fill="#f87171" opacity="0.6">Min level</text>

      {/* Y axis labels */}
      <text x="4" y="18" fontSize="8" fontFamily="ui-monospace,monospace" fill="rgba(255,255,255,0.3)">100%</text>
      <text x="4" y={h - 4} fontSize="8" fontFamily="ui-monospace,monospace" fill="rgba(255,255,255,0.3)">0%</text>

      {/* Today marker */}
      <circle cx="0" cy="20" r="3.5" fill={GREEN} opacity="0.9" />
      <text x="6" y="14" fontSize="8" fontFamily="ui-monospace,monospace" fill={GREEN} opacity="0.8">Today</text>
    </svg>
  );
}

export function SlideScheduling(_props: Props) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-7 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase mb-3" style={{ color: `${GREEN}80` }}>
          Predictive scheduling
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Predict. Schedule.<br />
          <span className="text-white/35">Never run dry.</span>
        </h2>
      </div>

      <div className="animate-fade-up delay-200 flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch">

        {/* Left - tank level prediction */}
        <div className="glass flex-1 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Tank 1 - janfieldtest2</p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border" style={{ borderColor:`${AMBER}40`, background:`${AMBER}10` }}>
              <AlertTriangle className="w-2.5 h-2.5" style={{ color: AMBER }} />
              <span className="text-[8px] font-mono font-bold" style={{ color: AMBER }}>LOW - 18% remaining</span>
            </div>
          </div>

          <TankCurve />

          <p className="text-[10px] font-mono text-white/30 text-center">
            Kaden calculates days remaining from current consumption rate
          </p>
        </div>

        {/* Right - schedule list */}
        <div className="glass flex-1 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Upcoming - All Sites</p>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 text-[9px] font-mono text-white/40 hover:text-white/60 transition-all">
              + Schedule visit
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {EVENTS.map(({ icon: Icon, label, date, daysOut, tagColor, site }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] animate-fade-up"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${tagColor}15`, border: `1px solid ${tagColor}30` }}
              >
                <Icon className="w-4 h-4" style={{ color: tagColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/75 leading-none truncate">{label}</p>
                <p className="text-[9px] font-mono text-white/30 mt-0.5">{site}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold font-mono text-white/70">{date}</p>
                <p className="text-[8px] font-mono mt-0.5" style={{ color: `${tagColor}80` }}>
                  {daysOut <= 7 ? `${daysOut}d - urgent` : `${daysOut} days out`}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-1 pt-3 border-t border-white/[0.06] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GREEN }} />
            <span className="text-[9px] font-mono text-white/30">
              All visits coordinated from one place - no phone calls, no spreadsheets
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
