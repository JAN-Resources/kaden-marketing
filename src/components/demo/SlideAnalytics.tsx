import { TrendingUp, BarChart2, Clock } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const WEEK_DATA = [
  { day: 'Mon', eff: 78, dose: 120 },
  { day: 'Tue', eff: 84, dose: 115 },
  { day: 'Wed', eff: 91, dose: 108 },
  { day: 'Thu', eff: 88, dose: 112 },
  { day: 'Fri', eff: 95, dose: 103 },
  { day: 'Sat', eff: 93, dose: 106 },
  { day: 'Sun', eff: 97, dose: 99  },
];

const maxDose = Math.max(...WEEK_DATA.map(d => d.dose));

export function SlideAnalytics(_props: Props) {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase mb-3" style={{ color:'#60a5fa80' }}>
          Weekly analytics
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Your performance report.<br />
          <span style={{ color:'#60a5fa' }}>Already written.</span>
        </h2>
      </div>

      <div className="animate-fade-up delay-200 glass p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Report header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white/70">Weekly Analytics Report</p>
            <p className="text-[10px] font-mono text-white/25 mt-0.5">Week of Aug 18, 2026 · janfieldtest2</p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/20">
            <Clock className="w-3 h-3" />
            Auto-generated Mon 06:00
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tower efficiency', value: '89.4%', icon: TrendingUp, delta: '+3.1% vs prev week', accent: '#4ade80' },
            { label: 'Chemical used',    value: '106 gal', icon: BarChart2, delta: '-8 gal saved',      accent: '#fbbf24' },
            { label: 'H2S compliance',   value: '99.8%',  icon: TrendingUp, delta: '+0.4% improvement', accent: '#4ade80' },
            { label: 'Uptime',           value: '100%',   icon: Clock,      delta: '7 / 7 days',         accent: '#60a5fa' },
          ].map(({ label, value, icon: Icon, delta, accent }) => (
            <div key={label} className="glass-sm px-4 py-3.5 flex flex-col gap-1.5" style={{ borderColor:`${accent}25` }}>
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color:`${accent}80` }} />
                <span className="text-[9px] font-mono uppercase tracking-wide leading-none" style={{ color:`${accent}80` }}>{label}</span>
              </div>
              <span className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: accent }}>{value}</span>
              <span className="text-[9px] font-mono text-white/30">{delta}</span>
            </div>
          ))}
        </div>

        {/* Dual chart: efficiency + dose */}
        <div className="flex flex-col gap-3">
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">Daily trends — efficiency & chemical dose</p>
          <div className="flex items-end gap-2 h-24">
            {WEEK_DATA.map(({ day, eff, dose }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: 56 }}>
                  {/* Efficiency bar */}
                  <div
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${eff}%`,
                      background: `rgba(74,222,128,${0.15 + (eff / 100) * 0.5})`,
                    }}
                  />
                  {/* Dose bar */}
                  <div
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${(dose / maxDose) * 100}%`,
                      background: `rgba(251,191,36,${0.08 + (dose / maxDose) * 0.18})`,
                      border: '1px solid rgba(251,191,36,0.20)',
                    }}
                  />
                </div>
                <span className="text-[8px] font-mono text-white/20">{day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-1.5 rounded-sm" style={{ background:'#4ade8066' }} />
              <span className="text-[9px] font-mono text-white/25">Efficiency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-1.5 rounded-sm" style={{ background:'#fbbf2433', border:'1px solid #fbbf2440' }} />
              <span className="text-[9px] font-mono text-white/25">Chemical dose</span>
            </div>
          </div>
        </div>
      </div>

      <p className="animate-fade-up delay-600 text-center text-white/20 text-[10px] font-mono">
        Delivered to your inbox automatically — no manual work required
      </p>
    </div>
  );
}
