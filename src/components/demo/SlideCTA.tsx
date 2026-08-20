import { Mail, ArrowRight } from 'lucide-react';
import { KadenBrandMark } from '../KadenBrandMark';

interface Props { started: boolean; onStart: () => void }

export function SlideCTA(_props: Props) {
  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-10 text-center px-6">
      {/* Kaden logo — same as sidebar */}
      <div className="animate-fade-up flex flex-col items-center gap-5">
        <div className="flex items-center gap-4 sm:gap-6">
          <KadenBrandMark className="w-12 h-12 sm:w-14 sm:h-14" color="white" gradientId="cta-kb" />
          <span
            className="text-4xl sm:text-5xl font-bold text-white leading-none"
            style={{ fontFamily: "'Michroma', sans-serif", letterSpacing: '0.04em' }}
          >
            KADEN AI
          </span>
        </div>
        <p className="text-xs font-mono tracking-[0.3em] uppercase text-white/30">
          Always in spec &nbsp;·&nbsp; Always on
        </p>
      </div>

      <div className="animate-fade-up delay-100 w-16 h-px bg-white/15" />

      <p className="animate-fade-up delay-200 text-2xl sm:text-4xl text-white/55 leading-relaxed max-w-lg">
        Ready to put your H2S control on autopilot?<br />
        <span className="text-white/85">Let's talk.</span>
      </p>

      {/* CTA button */}
      <div className="animate-fade-up delay-300">
        <a
          href="mailto:dmanly@janresources.com"
          className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-white text-black font-bold text-base transition-all hover:bg-white/90 hover:scale-105 active:scale-95 shadow-xl shadow-black/40"
        >
          <Mail className="w-5 h-5" />
          Get in touch
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <p className="animate-fade-up delay-400 text-sm font-mono text-white/30">
        dmanly@janresources.com
      </p>

      {/* Jan Resources logo */}
      <div className="animate-fade-up delay-500 flex flex-col items-center gap-2 opacity-25">
        <div className="w-16 h-px bg-white/20" />
        <img
          src={`${import.meta.env.BASE_URL}logo/janresources.png`}
          alt="Jan Resources"
          className="h-10 object-contain mt-1"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <p className="text-xs font-mono tracking-widest uppercase text-white/40">
          Monitoring · Automation · Analytics
        </p>
      </div>
    </div>
  );
}
