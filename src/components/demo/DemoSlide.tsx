import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  direction: number;
}

const variants = {
  enter:  (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export function DemoSlide({ children, direction }: Props) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="absolute inset-0 flex flex-col items-center justify-start sm:justify-center
                 px-3 sm:px-6 overflow-y-auto pt-14 pb-10 sm:pt-0 sm:pb-0"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </motion.div>
  );
}
