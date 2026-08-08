'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

interface ParallaxProps {
  readonly children: ReactNode;
  /**
   * Deslocamento em px em cada ponta da travessia pela viewport. Valores
   * diferentes entre elementos vizinhos é o que cria a sensação de planos.
   */
  readonly distance?: number;
  readonly className?: string;
}

/**
 * Move o elemento em contraponto à rolagem, criando planos de profundidade.
 *
 * Contínuo e amarrado à posição do scroll — nada de gatilho com duração fixa:
 * o elemento responde a cada pixel do gesto, que é o que faz a página parecer
 * fluida em vez de destravar em blocos.
 */
export function Parallax({ children, distance = 60, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
