import { DollarSign, Clock, CheckCircle2, TrendingDown, BarChart2, ArrowRight } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const BENEFITS = [
  {
    icon: DollarSign,
    accent: '#4ade80',
    label: 'Less chemical waste',
    heading: 'Stop over-dosing',
    desc: 'Manual dosing between site visits means guessing. Kaden adjusts continuously based on real gas flow and live H2S readings - so you never put in more triazene than the tower actually needs.',
  },
  {
    icon: Clock,
    accent: '#60a5fa',
    label: 'Labor back in your day',
    heading: 'Fewer truck rolls',
    desc: 'Every manual adjustment and emergency callout costs time and money. When the controller runs itself, your team focuses on higher-value work instead of routine pump tweaks.',
  },
  {
    icon: CheckCircle2,
    accent: '#4ade80',
    label: 'Continuous compliance',
    heading: 'Always in spec',
    desc: 'A site visit catches problems once a week at best. Kaden watches every minute and reacts in seconds - so your tower stays in spec even when nobody is on site.',
  },
];

export function SlideSavings(_props: Props) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase mb-4" style={{ color:'#4ade8080' }}>
          The bottom line
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Kaden <span style={{ color:'#4ade80' }}>pays for itself</span>
        </h2>
        <p className="animate-fade-up delay-200 text-white/35 text-base mt-3">
          Three ways Kaden recaptures cost - tracked live inside the platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {BENEFITS.map(({ icon: Icon, accent, label, heading, desc }, i) => (
          <div
            key={label}
            className="glass p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 animate-fade-up"
            style={{ animationDelay: `${0.2 + i * 0.12}s`, borderColor:`${accent}20` }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:`${accent}15`, border:`1px solid ${accent}30` }}>
              <Icon className="w-6 h-6" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color:`${accent}80` }}>{label}</p>
              <p className="text-xl font-bold text-white/85 leading-tight">{heading}</p>
            </div>
            <p className="text-sm text-white/35 leading-relaxed flex-1">{desc}</p>
          </div>
        ))}
      </div>

      {/* ROI tracking note */}
      <div className="animate-fade-up delay-600 flex items-center gap-3 px-5 py-3 glass-sm rounded-xl">
        <BarChart2 className="w-4 h-4 text-white/25 flex-shrink-0" />
        <p className="text-[10px] font-mono text-white/30 flex-1">
          Your actual savings are tracked inside Kaden - chemical used vs. baseline, labor hours, compliance uptime - all in your weekly report
        </p>
        <TrendingDown className="w-4 h-4 text-white/20 flex-shrink-0" />
        <ArrowRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
      </div>
    </div>
  );
}
