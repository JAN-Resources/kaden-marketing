import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

export function SlideAlerts(_props: Props) {
  const [phase, setPhase] = useState<'idle' | 'alarm' | 'ack'>('idle');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('alarm'), 700);
    const t2 = setTimeout(() => setPhase('ack'), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 px-6 items-center">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase mb-4" style={{ color:'#f8717180' }}>
          Instant alerts
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          You're notified<br />
          <span style={{ color:'#f87171' }}>before it's a problem</span>
        </h2>
      </div>

      <div className="animate-fade-up delay-200 flex flex-col sm:flex-row gap-6 sm:gap-10 items-center justify-center w-full">
        {/* Phone mockup */}
        <div className="relative w-44 sm:w-52 flex-shrink-0">
          <div
            className="relative rounded-[2.5rem] border-4 overflow-hidden shadow-2xl"
            style={{ background: '#111113', borderColor: 'rgba(255,255,255,0.12)', aspectRatio: '9/19' }}
          >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-10" />

            <div className="absolute inset-0 pt-7 pb-4 px-3 flex flex-col gap-2">
              {/* Status bar */}
              <div className="flex justify-between text-[7px] text-white/25 font-mono px-1 mt-1">
                <span>9:41</span><span>●●●</span>
              </div>

              {/* Lock screen bg */}
              <div className="flex-1 flex flex-col justify-center items-center gap-2">
                <span className="text-white/15 text-3xl font-light tabular-nums">9:41</span>
                <span className="text-white/10 text-[9px] font-mono">Wednesday, Aug 20</span>
              </div>

              {/* SMS notification */}
              {phase !== 'idle' && (
                <div className="animate-slide-down p-2 flex gap-2 rounded-xl border" style={{ background:'#f8717115', borderColor:'#f8717135' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'#f8717125' }}>
                    <MessageSquare className="w-3 h-3" style={{ color:'#f87171' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[8px] font-semibold" style={{ color:'#f87171cc' }}>Messages</span>
                      <span className="text-[7px] text-white/20 font-mono">now</span>
                    </div>
                    <p className="text-[7px] leading-tight font-mono" style={{ color:'#f87171aa' }}>
                      [ALARM] janfieldtest2 - Inlet H2S 47.3 ppm - above limit
                    </p>
                  </div>
                </div>
              )}

              {phase === 'ack' && (
                <div className="animate-fade-in glass-sm p-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-white/50 flex-shrink-0" />
                  <span className="text-[7px] font-mono text-white/40">Responded in 90s</span>
                </div>
              )}
            </div>
          </div>

          {/* Outer ring pulse when alarm fires */}
          {phase !== 'idle' && (
            <div className="absolute inset-0 rounded-[2.5rem] animate-pulse pointer-events-none" style={{ outline:'1px solid #f8717140' }} />
          )}
        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-5 max-w-sm">
          {[
            { icon: Bell,         title: 'Alarm raised',   desc: 'Any tag crossing a threshold sends a text to every configured number — instantly.' },
            { icon: MessageSquare,title: 'Reminders',      desc: 'If an alarm stays active, reminders keep firing until someone acts.' },
            { icon: CheckCircle2, title: 'All-clear SMS',  desc: 'When the condition resolves, a cleared notification goes out automatically.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="flex items-start gap-4 animate-fade-up" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-white/45" />
              </div>
              <div>
                <p className="text-base font-bold text-white/80">{title}</p>
                <p className="text-sm text-white/35 leading-relaxed mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
