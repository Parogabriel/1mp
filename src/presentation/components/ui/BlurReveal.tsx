'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface BlurRevealProps {
  readonly children: ReactNode;
  /** Atraso em segundos, para encadear irmãos em cascata. */
  readonly delay?: number;
  readonly className?: string;
}

/**
 * Entrada blur-in com mola: o elemento chega desfocado e menor, e assenta com
 * overshoot curto. `whileInView` com `once` — anima na primeira vez que entra na
 * viewport e nunca mais, pra rolagem de volta não repetir a coreografia.
 */
export function BlurReveal({ children, delay = 0, className }: BlurRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.95, filter: 'blur(10px)', y: 18 }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24, delay }}
    >
      {children}
    </motion.div>
  );
}
