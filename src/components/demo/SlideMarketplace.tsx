import { ShoppingCart, Package, Zap, Star } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const GREEN = '#4ade80';
const AMBER = '#fbbf24';
const BLUE  = '#60a5fa';

interface Product {
  name:       string;
  category:   string;
  price:      string;
  stock:      'In Stock' | '3-5 days' | 'Special Order';
  badge?:     string;
  badgeColor?: string;
  desc:       string;
}

const PRODUCTS: Product[] = [
  {
    name:       'Triazene - 55 gal drum',
    category:   'Chemical',
    price:      '$$$',
    stock:      'In Stock',
    badge:      'Kaden Recommended',
    badgeColor: GREEN,
    desc:       'Based on your current consumption of 18.4 gal/day, reorder by Aug 26',
  },
  {
    name:       'Pump Diaphragm Kit',
    category:   'Maintenance',
    price:      '$$$',
    stock:      'In Stock',
    desc:       'Compatible with your Prominent Sigma pump - model confirmed',
  },
  {
    name:       'H2S Sensor Probe',
    category:   'Instrumentation',
    price:      '$$$',
    stock:      '3-5 days',
    badge:      'Calibration Due',
    badgeColor: AMBER,
    desc:       'Outlet sensor at janfieldtest2 - last calibrated 11 months ago',
  },
  {
    name:       'Pressure Transmitter',
    category:   'Instrumentation',
    price:      '$$$',
    stock:      'In Stock',
    desc:       'Direct replacement for Rosemount 3051 - pre-configured for Modbus RTU',
  },
  {
    name:       'Packing Media - 2 cu ft',
    category:   'Tower',
    price:      '$$$',
    stock:      'In Stock',
    desc:       'Compatible with your scrubber tower OD and packing bed height',
  },
  {
    name:       'Chemical Injection Pump',
    category:   'Equipment',
    price:      '$$$',
    stock:      'Special Order',
    badge:      'Quote Required',
    badgeColor: BLUE,
    desc:       'Flow-rated for your site gas volume - spec sheet available',
  },
];

const STOCK_COLOR: Record<Product['stock'], string> = {
  'In Stock':     GREEN,
  '3-5 days':     AMBER,
  'Special Order':'#60a5fa',
};

export function SlideMarketplace(_props: Props) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-7 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase mb-3" style={{ color: `${BLUE}80` }}>
          Marketplace
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Order what you need.<br />
          <span className="text-white/35">Right from the platform.</span>
        </h2>
      </div>

      {/* Marketplace header */}
      <div className="animate-fade-up delay-150 flex items-center gap-3 px-4 py-2.5 glass rounded-xl">
        <ShoppingCart className="w-4 h-4 text-white/30" />
        <span className="text-[10px] font-mono text-white/30">
          Kaden knows your site configuration - every item is pre-matched to your equipment
        </span>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono" style={{ borderColor:`${GREEN}40`, color: GREEN }}>
          <Star className="w-2.5 h-2.5" />
          Kaden Recommended items highlighted
        </div>
      </div>

      {/* Product grid */}
      <div className="animate-fade-up delay-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRODUCTS.map(({ name, category, price, stock, badge, badgeColor, desc }, i) => (
          <div
            key={name}
            className="glass-sm p-4 flex flex-col gap-3 rounded-xl border border-white/[0.07] hover:border-white/15 transition-all animate-fade-up"
            style={{
              animationDelay: `${0.2 + i * 0.07}s`,
              boxShadow: badge && badgeColor === GREEN ? `inset 0 0 0 1px ${GREEN}25` : undefined,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-white/40" />
              </div>
              <div
                className="px-1.5 py-0.5 rounded text-[7px] font-mono font-bold uppercase tracking-wider flex-shrink-0"
                style={{ background: `${STOCK_COLOR[stock]}18`, color: STOCK_COLOR[stock] }}
              >
                {stock}
              </div>
            </div>

            {/* Name + category */}
            <div>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{category}</p>
              <p className="text-sm font-bold text-white/85 mt-0.5 leading-tight">{name}</p>
            </div>

            {/* Badge */}
            {badge && (
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-mono font-bold"
                style={{ background: `${badgeColor}12`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
              >
                <Zap className="w-2.5 h-2.5" />
                {badge}
              </div>
            )}

            {/* Description */}
            <p className="text-[9px] text-white/35 leading-relaxed flex-1">{desc}</p>

            {/* Price + CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <span className="text-base font-bold font-mono text-white/80">{price}</span>
              <button
                className="px-3 py-1.5 rounded-lg text-[9px] font-bold font-mono transition-all hover:scale-105 active:scale-95"
                style={{ background: `${GREEN}20`, color: GREEN, border: `1px solid ${GREEN}35` }}
              >
                Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
