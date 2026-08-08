'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * Anima cada linha nova que o ticker insere no topo da lista.
 *
 * MutationObserver em vez de efeito por render: as linhas antigas mantêm a
 * identidade de DOM entre atualizações, então só o nó recém-inserido deve animar.
 */
export function useGsapListEnter(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          gsap.fromTo(
            node,
            { y: -12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' },
          );
        }
      }
    });

    observer.observe(list, { childList: true });
    return () => observer.disconnect();
  }, [ref]);
}
