const OUTER = [
  { x: 20, y: 5 },
  { x: 32.99, y: 12.5 },
  { x: 32.99, y: 27.5 },
  { x: 20, y: 35 },
  { x: 7.01, y: 27.5 },
  { x: 7.01, y: 12.5 },
] as const;

interface Props {
  size?: number;
  color?: string;
  gradientId?: string;
  className?: string;
}

export function KadenBrandMark({ size, color = 'white', gradientId = 'kb-grad', className }: Props) {
  const stroke = `url(#${gradientId})`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={`flex-shrink-0${className ? ` ${className}` : ''}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      {OUTER.map((p, i) => (
        <line key={`s${i}`} x1={20} y1={20} x2={p.x} y2={p.y} stroke={stroke} strokeWidth="1.8" />
      ))}
      {OUTER.map((p, i) => {
        const n = OUTER[(i + 1) % 6];
        return <line key={`r${i}`} x1={p.x} y1={p.y} x2={n.x} y2={n.y} stroke={stroke} strokeWidth="1" strokeOpacity={0.35} />;
      })}
      {OUTER.map((p, i) => (
        <circle key={`n${i}`} cx={p.x} cy={p.y} r={2.2} fill={stroke} />
      ))}
      <circle cx={20} cy={20} r={3} fill={stroke} />
    </svg>
  );
}
