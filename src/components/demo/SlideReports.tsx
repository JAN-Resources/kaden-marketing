import { BarChart2, FileText, Clock, TrendingUp } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const BARS = [
  { label: 'Mon', pct: 78 }, { label: 'Tue', pct: 84 }, { label: 'Wed', pct: 91 },
  { label: 'Thu', pct: 88 }, { label: 'Fri', pct: 95 }, { label: 'Sat', pct: 93 },
  { label: 'Sun', pct: 97 },
];

export function SlideReports(_props: Props) {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-7">
      <div className="text-center">
        <p className="animate-fade-up text-xs font-mono tracking-widest uppercase text-white/30 mb-3">
          Automated reporting
        </p>
        <h2 className="animate-fade-up delay-100 text-3xl sm:text-4xl font-bold text-white">
          Your weekly report.<br />
          <span className="text-emerald-400">Already written.</span>
        </h2>
      </div>

      {/* Report card */}
      <div className="animate-fade-up delay-200 glass p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Weekly Performance Report</p>
              <p className="text-[10px] font-mono text-white/35">Week of Aug 18, 2026 · janfieldtest2</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/30">
            <Clock className="w-3 h-3" />
            <span>Auto-generated Mon 06:00</span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tower Efficiency',  value: '94.2%',    color: '#4ade80', icon: TrendingUp  },
            { label: 'Triazine Used',     value: '118 gal',  color: '#60a5fa', icon: BarChart2   },
            { label: 'H2S Compliance',    value: '99.8%',    color: '#a78bfa', icon: FileText    },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="glass-sm px-3 py-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" style={{ color }} />
                <span className="text-[9px] font-mono text-white/35 uppercase tracking-wide">{label}</span>
              </div>
              <span className="text-xl font-bold tabular-nums" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div>
          <p className="text-[10px] font-mono text-white/30 mb-2">Tower efficiency — daily</p>
          <div className="flex items-end gap-1.5 h-16">
            {BARS.map(({ label, pct }, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: 48 }}>
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${pct}%`,
                      background: `rgba(74,222,128,${0.3 + (pct / 100) * 0.5})`,
                      animationDelay: `${0.3 + i * 0.07}s`,
                    }}
                  />
                </div>
                <span className="text-[8px] font-mono text-white/25">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="animate-fade-up delay-600 text-center text-white/30 text-xs font-mono">
        Reports sent automatically to your inbox — no manual work required
      </p>
    </div>
  );
}
