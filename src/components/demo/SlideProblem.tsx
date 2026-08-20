import { Truck, ClipboardList, Clock } from 'lucide-react';

interface Props { started: boolean; onStart: () => void }

const PROBLEMS = [
  {
    icon: Truck,
    title: 'Drive to the site',
    desc: 'Hours of travel just to read a gauge or adjust a single pump setting.',
    delay: 'delay-200',
  },
  {
    icon: ClipboardList,
    title: 'Guess the dose',
    desc: 'Manual calculations from readings that are already hours or days out of date.',
    delay: 'delay-400',
  },
  {
    icon: Clock,
    title: 'Hope for the best',
    desc: 'No visibility between visits — towers drift out of spec and no one knows.',
    delay: 'delay-600',
  },
];

export function SlideProblem(_props: Props) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-10 px-6">
      <div className="text-center">
        <p className="animate-fade-up text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 mb-4">
          The old way
        </p>
        <h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl font-bold text-white leading-tight">
          Manual H2S management<br />
          <span className="text-white/35">costs more than you think</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PROBLEMS.map(({ icon: Icon, title, desc, delay }) => (
          <div key={title} className={`glass p-5 sm:p-8 flex flex-col gap-4 sm:gap-5 animate-fade-up ${delay}`}>
            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white/50" />
            </div>
            <div>
              <p className="font-bold text-white/85 text-lg mb-2">{title}</p>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="animate-fade-up delay-700 text-center text-white/20 text-sm font-mono tracking-widest">
        There is a better way →
      </p>
    </div>
  );
}
