import { useEffect, useState } from 'react';

interface Props { started: boolean; onStart: () => void }

const BASE_SEC = 14 * 3600 + 23 * 60 + 1;
const fmt = (delta: number) => {
  const s = BASE_SEC + delta;
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
};

const EVENTS = [
  { at:0,  color:'#34d399', tag:'WORKER 1', cam:'CAM-01', msg:'Hard hat detected - PPE compliant' },
  { at:3,  color:'#f59e0b', tag:'WORKER 2', cam:'CAM-01', msg:'No hard hat - safety violation flagged' },
  { at:6,  color:'#ef4444', tag:'ZONE A',   cam:'CAM-02', msg:'Chemical leak detected - triazene spill' },
  { at:9,  color:'#f59e0b', tag:'WORKER 2', cam:'CAM-02', msg:'Entering hazard zone - alert sent' },
  { at:12, color:'#34d399', tag:'SYSTEM',   cam:'SYS',    msg:'Supervisor notified · Response en route' },
];

export function SlideSurveillance(_props: Props) {
  const [tick, setTick]   = useState(0);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => { setTick(t => t + 1); setBlink(b => !b); }, 1000);
    return () => clearInterval(id);
  }, []);

  const visible = EVENTS.filter(e => tick >= e.at);
  const w2Show  = tick >= 3;
  const gasShow = tick >= 6;

  const gasR = 0.5 + Math.sin(tick * 0.7) * 0.15;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-5 px-4 animate-fade-up">

      {/* Header */}
      <div className="text-center">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase mb-3 animate-fade-up"
          style={{ color:'#60a5fa80' }}>
          AI Site Surveillance
        </p>
        <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight animate-fade-up delay-100">
          Eyes on every corner.<br />
          <span style={{ color:'#60a5fa' }}>AI that never blinks.</span>
        </h2>
      </div>

      {/* Content */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">

        {/* ── Camera feed ── */}
        <div className="flex-1 rounded-xl overflow-hidden"
          style={{ background:'#07070d', border:'1px solid rgba(255,255,255,0.08)' }}>

          {/* Feed header bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'7px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontFamily:'ui-monospace,monospace', fontSize:10.5, letterSpacing:'0.15em',
              color:'rgba(255,255,255,0.4)' }}>
              CAM-01 · NORTH ZONE · LIVE
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#ef4444',
                opacity: blink ? 1 : 0.15, display:'inline-block', transition:'opacity 0.1s' }} />
              <span style={{ fontFamily:'ui-monospace,monospace', fontSize:10,
                color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em' }}>REC</span>
            </div>
          </div>

          {/* SVG camera view */}
          <svg viewBox="0 0 640 330" style={{ width:'100%', display:'block' }}>
            <defs>
              <style>{`
                @keyframes sv-march { to { stroke-dashoffset: -22; } }
                @keyframes sv-gas   { 0%,100%{opacity:.4} 50%{opacity:.75} }
                @keyframes sv-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                .sv-m { animation: sv-march 1.1s linear infinite; }
                .sv-mr{ animation: sv-march 1.1s linear infinite reverse; }
                .sv-g { animation: sv-gas 2.2s ease-in-out infinite; }
              `}</style>

              <radialGradient id="sv-grd" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#ef4444" stopOpacity={gasR} />
                <stop offset="55%"  stopColor="#ef4444" stopOpacity={gasR * 0.35} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>

              {/* Scanlines */}
              <pattern id="sv-sl" x="0" y="0" width="1" height="5" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="1" height="1" fill="rgba(0,0,0,0.18)" />
              </pattern>

              {/* Vignette */}
              <radialGradient id="sv-vig" cx="50%" cy="50%" r="70%">
                <stop offset="60%"  stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
              </radialGradient>
            </defs>

            {/* Bg */}
            <rect width="640" height="330" fill="#080810" />
            <rect width="640" height="330" fill="url(#sv-sl)" />

            {/* Distant equipment silhouettes */}
            <rect x="18"  y="205" width="55"  height="95"  rx="2" fill="rgba(255,255,255,0.025)" />
            <rect x="40"  y="172" width="9"   height="34"  fill="rgba(255,255,255,0.035)" />
            <rect x="490" y="195" width="80"  height="105" rx="2" fill="rgba(255,255,255,0.025)" />
            <rect x="525" y="158" width="11"  height="38"  fill="rgba(255,255,255,0.03)"  />
            <rect x="548" y="168" width="8"   height="28"  fill="rgba(255,255,255,0.025)" />

            {/* Ground */}
            <line x1="0" y1="292" x2="640" y2="292" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

            {/* ── Worker 1 -PPE compliant ── */}
            <g>
              {/* Marching dashes bbox */}
              <rect x="75" y="98" width="112" height="194"
                fill="rgba(52,211,153,0.04)" stroke="#34d399" strokeWidth="1.6"
                strokeDasharray="9 5" className="sv-m" />
              {/* Corner L-brackets */}
              {[[75,98],[187,98],[75,292],[187,292]].map(([cx,cy],i) => {
                const sx = i%2===0 ? 1 : -1, sy = i<2 ? 1 : -1;
                return <g key={i}>
                  <line x1={cx} y1={cy} x2={cx+sx*14} y2={cy} stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1={cx} y1={cy} x2={cx} y2={cy+sy*14} stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
                </g>;
              })}

              {/* Hard hat */}
              <ellipse cx="131" cy="116" rx="21" ry="9"  fill="#fbbf24" opacity="0.92" />
              <ellipse cx="131" cy="121" rx="23" ry="5"  fill="#f59e0b" opacity="0.85" />
              {/* Head */}
              <circle  cx="131" cy="138" r="15" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
              {/* Body + hi-vis vest */}
              <rect x="113" y="155" width="36" height="64" rx="3" fill="rgba(255,255,255,0.1)" />
              <rect x="113" y="155" width="36" height="64" rx="3" fill="#f59e0b" fillOpacity="0.22" />
              <line x1="131" y1="155" x2="131" y2="219" stroke="#f59e0b" strokeWidth="3" strokeOpacity="0.38" />
              {/* Arms */}
              <line x1="113" y1="165" x2="96"  y2="202" stroke="rgba(255,255,255,0.13)" strokeWidth="7" strokeLinecap="round" />
              <line x1="149" y1="165" x2="166" y2="202" stroke="rgba(255,255,255,0.13)" strokeWidth="7" strokeLinecap="round" />
              {/* Legs */}
              <line x1="122" y1="219" x2="116" y2="285" stroke="rgba(255,255,255,0.13)" strokeWidth="9" strokeLinecap="round" />
              <line x1="140" y1="219" x2="146" y2="285" stroke="rgba(255,255,255,0.13)" strokeWidth="9" strokeLinecap="round" />

              {/* Label chip */}
              <rect x="64" y="78" width="134" height="16" rx="2.5" fill="rgba(52,211,153,0.92)" />
              <text x="131" y="90" textAnchor="middle" fontSize="9" fontFamily="ui-monospace,monospace" fontWeight="700" fill="#022c22">
                WORKER 1 · PPE ✓ · 99%
              </text>
            </g>

            {/* ── Worker 2 -NO hard hat ── */}
            <g style={{ opacity: w2Show ? 1 : 0, transition:'opacity 0.5s' }}>
              <rect x="305" y="92" width="112" height="200"
                fill="rgba(245,158,11,0.03)" stroke="#f59e0b" strokeWidth="1.6"
                strokeDasharray="9 5" className="sv-mr" />
              {[[305,92],[417,92],[305,292],[417,292]].map(([cx,cy],i) => {
                const sx = i%2===0 ? 1 : -1, sy = i<2 ? 1 : -1;
                return <g key={i}>
                  <line x1={cx} y1={cy} x2={cx+sx*14} y2={cy} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1={cx} y1={cy} x2={cx} y2={cy+sy*14} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
                </g>;
              })}

              {/* No-hat X indicator */}
              <circle cx="361" cy="103" r="11" fill="rgba(239,68,68,0.85)" />
              <text x="361" y="108" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fontWeight="bold" fill="white">✕</text>

              {/* Head */}
              <circle  cx="361" cy="126" r="15" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              {/* Body */}
              <rect x="344" y="143" width="36" height="64" rx="3" fill="rgba(255,255,255,0.1)" />
              {/* Arms */}
              <line x1="344" y1="153" x2="326" y2="190" stroke="rgba(255,255,255,0.12)" strokeWidth="7" strokeLinecap="round" />
              <line x1="380" y1="153" x2="397" y2="190" stroke="rgba(255,255,255,0.12)" strokeWidth="7" strokeLinecap="round" />
              {/* Legs */}
              <line x1="352" y1="207" x2="346" y2="285" stroke="rgba(255,255,255,0.12)" strokeWidth="9" strokeLinecap="round" />
              <line x1="370" y1="207" x2="376" y2="285" stroke="rgba(255,255,255,0.12)" strokeWidth="9" strokeLinecap="round" />

              {/* Label chip */}
              <rect x="290" y="71" width="142" height="16" rx="2.5" fill="rgba(245,158,11,0.92)" />
              <text x="361" y="83" textAnchor="middle" fontSize="9" fontFamily="ui-monospace,monospace" fontWeight="700" fill="#431407">
                WORKER 2 · NO HARD HAT · 94%
              </text>
            </g>

            {/* ── Gas cloud ── */}
            <g style={{ opacity: gasShow ? 1 : 0, transition:'opacity 0.7s' }}>
              <ellipse cx="538" cy="248" rx="72" ry="44" fill="url(#sv-grd)" className="sv-g" />
              <ellipse cx="538" cy="248" rx="42" ry="26" fill="rgba(239,68,68,0.12)" />
              {[0,1,2,3,4].map(i => (
                <circle key={i}
                  cx={514 + i * 13 + Math.sin(tick * 0.4 + i) * 6}
                  cy={235 + Math.cos(tick * 0.5 + i) * 11}
                  r={2.5 + i * 0.7}
                  fill="rgba(239,68,68,0.45)" className="sv-g" />
              ))}
              <rect x="484" y="215" width="108" height="16" rx="2.5" fill="rgba(239,68,68,0.9)" />
              <text x="538" y="227" textAnchor="middle" fontSize="9" fontFamily="ui-monospace,monospace" fontWeight="700" fill="white">
                CHEM LEAK · TRIAZENE · ZONE A
              </text>
            </g>

            {/* Vignette overlay */}
            <rect width="640" height="330" fill="url(#sv-vig)" />

            {/* Camera corner brackets */}
            {['M0,18 L0,0 L18,0','M622,0 L640,0 L640,18','M0,312 L0,330 L18,330','M622,330 L640,330 L640,312'].map((d,i) => (
              <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" />
            ))}

            {/* Timestamp */}
            <text x="10" y="322" fontSize="11" fontFamily="ui-monospace,monospace" fill="rgba(255,255,255,0.3)">
              {fmt(tick)}
            </text>

            {/* Workers counter */}
            <rect x="10" y="7" width="76" height="15" rx="2" fill="rgba(255,255,255,0.06)" />
            <text x="48" y="19" textAnchor="middle" fontSize="10" fontFamily="ui-monospace,monospace" fill="rgba(255,255,255,0.45)">
              {w2Show ? '2' : '1'} ON SITE
            </text>

            {/* AI label */}
            <text x="630" y="322" textAnchor="end" fontSize="9.5" fontFamily="ui-monospace,monospace" fill="rgba(255,255,255,0.18)">
              KADEN-VISION
            </text>
          </svg>
        </div>

        {/* ── Event log (desktop only) ── */}
        <div className="hidden sm:flex flex-col gap-2" style={{ width:228, flexShrink:0 }}>
          <p style={{ fontFamily:'ui-monospace,monospace', fontSize:10, letterSpacing:'0.2em',
            textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:2 }}>
            Live Detections
          </p>

          {visible.map((e) => (
            <div key={e.at} className="animate-fade-up"
              style={{ background:'rgba(14,14,20,0.95)', border:`1px solid rgba(255,255,255,0.07)`,
                borderLeft:`3px solid ${e.color}`, borderRadius:8, padding:'8px 10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                <span style={{ fontFamily:'ui-monospace,monospace', fontSize:11, fontWeight:700, color:e.color }}>{e.tag}</span>
                <span style={{ fontFamily:'ui-monospace,monospace', fontSize:9, color:'rgba(255,255,255,0.22)' }}>{e.cam}</span>
              </div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:1.4, marginBottom:3 }}>{e.msg}</p>
              <span style={{ fontFamily:'ui-monospace,monospace', fontSize:9, color:'rgba(255,255,255,0.2)' }}>{fmt(e.at)}</span>
            </div>
          ))}

          {/* Summary grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5, marginTop:4 }}>
            {[
              { label:'On Site',    val: w2Show ? '2' : '1', c: '#34d399' },
              { label:'PPE OK',     val: w2Show ? '1 / 2' : '1 / 1', c: w2Show ? '#f59e0b' : '#34d399' },
              { label:'Chem Alerts', val: gasShow ? '1' : '0', c: gasShow ? '#ef4444' : '#34d399' },
              { label:'Alerts Sent',val: tick >= 9 ? '2' : '0', c: tick >= 9 ? '#f59e0b' : '#34d399' },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(14,14,20,0.95)',
                border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:'6px 8px' }}>
                <p style={{ fontFamily:'ui-monospace,monospace', fontSize:9, color:'rgba(255,255,255,0.3)',
                  textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{s.label}</p>
                <p style={{ fontFamily:'ui-monospace,monospace', fontSize:15, fontWeight:700, color:s.c }}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
