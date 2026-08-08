'use client';

import { useEffect, type RefObject } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';

/**
 * Interpola a opacidade de um elemento a partir de um MotionValue de progresso,
 * escrevendo direto no style.
 *
 * Por que não `style={{ opacity }}` no motion.div: nesta versão do framer-motion
 * um MotionValue ligado a `style.opacity` é aplicado no primeiro render e nunca
 * mais atualiza — enquanto `y`, `scale` e `rotate` do mesmo MotionValue de origem
 * atualizam normalmente. Verificado em três componentes distintos antes de
 * escrever isto. Aqui a escrita é explícita, então não depende desse caminho.
 */
export function useScrollOpacity(
  progress: MotionValue<number>,
  ref: RefObject<HTMLElement | null>,
  input: readonly [number, number],
  output: readonly [number, number],
): void {
  const [inStart, inEnd] = input;
  const [outStart, outEnd] = output;

  const opacityAt = (p: number): string => {
    const span = inEnd - inStart;
    const t = span === 0 ? 1 : Math.min(1, Math.max(0, (p - inStart) / span));
    return String(outStart + (outEnd - outStart) * t);
  };

  useMotionValueEvent(progress, 'change', (p) => {
    const el = ref.current;
    if (el) el.style.opacity = opacityAt(p);
  });

  // Estado inicial: sem isto o elemento nasce com a opacidade do primeiro stop
  // e só corrige no primeiro evento de scroll — visível ao carregar no meio da página.
  useEffect(() => {
    const el = ref.current;
    if (el) el.style.opacity = opacityAt(progress.get());
    // opacityAt é recriada por render, mas depende só destes primitivos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, ref, inStart, inEnd, outStart, outEnd]);
}
