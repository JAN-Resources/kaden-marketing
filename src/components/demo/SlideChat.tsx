import { useEffect, useState } from 'react';
import { KadenBrandMark } from '../KadenBrandMark';

interface Props { started: boolean; onStart: () => void }

const CONVERSATION = [
  {
    role: 'user' as const,
    text: "What's causing the high H2S at janfieldtest2?",
    delay: 300,
  },
  {
    role: 'kaden' as const,
    text: "Outlet H2S has been 4.2 ppm for the last 2 hours — above the 3.5 ppm spec. Flow rate increased 15% at 08:40 but the dose command hadn't adjusted yet. I've recalculated and bumped the dose from 16.4 → 19.1 gal/day.",
    delay: 1800,
  },
  {
    role: 'user' as const,
    text: "When was the last time efficiency dropped this low?",
    delay: 4800,
  },
  {
    role: 'kaden' as const,
    text: "March 14 — a similar flow spike with a 6-hour delay in dose response. Tower efficiency recovered within 2 hours once dosing caught up. Current trajectory looks similar.",
    delay: 6200,
  },
];

export function SlideChat(_props: Props) {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    setVisible([]);
    const timers = CONVERSATION.map((msg, i) => {
      const t = setTimeout(() => setVisible(prev => [...prev, i]), msg.delay);
      return t;
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-4xl flex flex-col gap-7 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 mb-3">
          Ask Kaden anything
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Plain language answers.<br />
          <span className="text-white/35">No spreadsheets.</span>
        </h2>
      </div>

      {/* Chat window */}
      <div className="animate-fade-up delay-200 glass overflow-hidden flex flex-col" style={{ minHeight: 260 }}>
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-white/[0.07] flex items-center gap-2.5">
          <KadenBrandMark size={16} color="rgba(255,255,255,0.5)" gradientId="chat-kb" />
          <span
            className="text-[11px] text-white/40 tracking-wider"
            style={{ fontFamily: "'Michroma', sans-serif" }}
          >
            KADEN AI
          </span>
          <span className="ml-auto flex items-center gap-1 text-[9px] font-mono text-white/25">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse-dot" />
            janfieldtest2
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ minHeight: 160 }}>
          {CONVERSATION.map((msg, i) => (
            visible.includes(i) ? (
              <div
                key={i}
                className={`flex animate-fade-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'kaden' && (
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <span className="text-[8px] font-bold text-white/50">K</span>
                  </div>
                )}
                <div
                  className="max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'user'
                      ? 'rgba(255,255,255,0.10)'
                      : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: msg.role === 'user' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.60)',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ) : null
          ))}
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-white/[0.07] flex items-center gap-2">
          <div className="flex-1 glass-sm px-3 py-2 text-[11px] font-mono text-white/20">
            Ask about any site, tag, or trend…
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center">
            <span className="text-[10px] text-white/30">↑</span>
          </div>
        </div>
      </div>

      <p className="animate-fade-up delay-600 text-center text-white/20 text-[10px] font-mono">
        Kaden knows your live data, history, and configuration — ask anything
      </p>
    </div>
  );
}
