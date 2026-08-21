import { Cpu, Activity, Wind, Droplets, Wifi, CheckCircle2, PhoneCall } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const REQS = [
  { icon: Cpu,          label: 'PLC / RTU',              desc: 'The on-site controller that talks Modbus - reads your instruments and receives Kaden\'s commands.' },
  { icon: Activity,     label: 'H2S Sensors',            desc: 'Inlet and outlet sensors wired into the PLC so Kaden can track what\'s going in and coming out.' },
  { icon: Wind,         label: 'Gas Flow Meter',         desc: 'Real-time flow data lets Kaden calculate the right scavenger dose for actual site conditions.' },
  { icon: Droplets,     label: 'Modbus Dosing Pump',     desc: 'A Modbus-capable chemical injection pump so Kaden can write dose commands directly.' },
  { icon: Wifi,         label: 'Cellular Connectivity',  desc: 'A cell signal at the site - no on-site PC, server, or VPN needed. Everything else runs in the cloud.' },
];

export function SlideRequirements(_props: Props) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 mb-4">
          What you need
        </p>
        <h2 className="animate-fade-up delay-100 text-3xl sm:text-4xl font-bold text-white leading-tight">
          Simple to connect.<br />Ready in days.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up delay-200">
        {/* Requirements list - takes 2 cols */}
        <div className="sm:col-span-2 grid grid-cols-1 gap-2">
          {REQS.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className="glass-sm px-4 py-3 flex items-start gap-3 animate-fade-up"
              style={{ animationDelay: `${0.25 + i * 0.08}s` }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-white/45" />
              </div>
              <div>
                <p className="font-semibold text-white/85 text-sm leading-none mb-1">{label}</p>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-1 ml-auto" style={{ color: 'rgba(52,211,153,0.4)' }} />
            </div>
          ))}
        </div>

        {/* "We'll get you set up" card */}
        <div
          className="glass-sm flex flex-col justify-between gap-4 p-5 animate-fade-up delay-500"
          style={{ borderLeft: '2px solid rgba(52,211,153,0.35)' }}
        >
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <PhoneCall className="w-5 h-5" style={{ color: '#34d399' }} />
            </div>
            <p className="text-white font-bold text-base leading-snug">
              Don't have everything in place yet?
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              No problem. Jan Resources can supply and commission every piece of equipment you need - sensors, PLCs, pumps, and connectivity - end to end.
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              We've done it before. We'll do it for you.
            </p>
          </div>

          <div
            className="rounded-lg px-4 py-3 text-center"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
          >
            <p className="text-xs font-mono tracking-widest uppercase" style={{ color: '#34d399' }}>
              Full turnkey available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
