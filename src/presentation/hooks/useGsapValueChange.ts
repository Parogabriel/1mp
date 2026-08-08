'use client';

import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * Pulse curto quando o valor exibido muda — confirma que o número reagiu ao input.
 *
 * Personality Corporate: 180ms, ease-out, sem overshoot. Escala em vez de cor
 * porque o valor já carrega cor semântica (accent/signal) que não deve piscar.
 */
export function useGsapValueChange(
  ref: RefObject<HTMLElement | null>,
  value: string | number,
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tween = gsap.fromTo(
      el,
      { scale: 1.06 },
      { scale: 1, duration: 0.18, ease: 'power2.out' },
    );

    return () => {
      tween.kill();
      gsap.set(el, { clearProps: 'transform' });
    };
  }, [ref, value]);
}
