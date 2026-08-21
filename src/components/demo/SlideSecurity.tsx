import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const PILLARS = [
  {
    icon:  ShieldCheck,
    title: 'Your site stays protected',
    body:  'Your field equipment only reaches out to Kaden - nothing can reach back in. There is no open door to your PLC from the internet.',
    color: '#34d399',
  },
  {
    icon:  Lock,
    title: 'Your data is private',
    body:  'Everything we collect is encrypted and stored securely. Only your team can see your site\'s data. Nobody else - not even us without your permission.',
    color: '#60a5fa',
  },
  {
    icon:  Eye,
    title: 'Only you control access',
    body:  'You decide who can view your sites and who can make changes. Every login is authenticated. Unauthorised access is blocked.',
    color: '#a78bfa',
  },
  {
    icon:  FileText,
    title: 'Every action is on record',
    body:  'Every reading logged. Every command recorded with a timestamp. If something ever comes into question, you have the full history.',
    color: '#fbbf24',
  },
];

export function SlideSecurity(_props: Props) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-7 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 mb-4">
          Security & trust
        </p>
        <h2 className="animate-fade-up delay-100 text-3xl sm:text-4xl font-bold text-white leading-tight">
          Your site. Your data.<br />Nobody else's.
        </h2>
        <p className="animate-fade-up delay-200 text-white/40 text-base mt-3 max-w-lg mx-auto">
          Kaden runs on the same infrastructure trusted by the world's largest enterprises - so your data is in safe hands.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PILLARS.map(({ icon: Icon, title, body, color }, i) => (
          <div
            key={title}
            className="glass-sm px-5 py-4 flex gap-4 items-start animate-fade-up"
            style={{ animationDelay: `${0.3 + i * 0.1}s`, borderLeft: `2px solid ${color}22` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="font-semibold text-white/85 text-sm mb-1">{title}</p>
              <p className="text-white/40 text-sm leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="animate-fade-up delay-700 rounded-xl px-6 py-4 flex items-center justify-center gap-3"
        style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}
      >
        <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
        <p className="text-sm text-white/50 text-center">
          Questions about security? We're happy to walk you through exactly how your data is protected.
        </p>
      </div>
    </div>
  );
}
