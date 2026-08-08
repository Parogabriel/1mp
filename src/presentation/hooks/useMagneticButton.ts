'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * Puxa o elemento em direção ao cursor dentro de um raio de ação, solta com
 * mola ao sair. Só ativa em ponteiro fino (mouse) — em touch não há "perto do
 * cursor" e a área magnética só atrapalharia o toque.
 *
 * `strength` menor que 1 porque o movimento total do elemento deve ser uma
 * fração do movimento do cursor — seguir 1:1 parece bug de framerate, não ímã.
 */
export function useMagneticButton(ref: RefObject<HTMLElement | null>, strength = 0.35) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      gsap.to(el, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    };

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerleave', handleLeave);

    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerleave', handleLeave);
      gsap.killTweensOf(el);
    };
  }, [ref, strength]);
}
