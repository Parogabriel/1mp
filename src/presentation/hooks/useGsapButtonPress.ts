'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * Hover/press nos CTAs do hero.
 *
 * Personality Playful no release (back.out) e Corporate no press: o squash é
 * curto e sem bounce pra não competir com o clique.
 */
export function useGsapButtonPress(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const to = (scale: number, duration: number, ease: string) =>
      gsap.to(el, { scale, duration, ease, overwrite: 'auto' });

    const enter = () => to(1.03, 0.15, 'power2.out');
    const leave = () => to(1, 0.2, 'power2.out');
    const down = () => to(0.96, 0.1, 'power2.in');
    const up = () => to(1.03, 0.25, 'back.out(2.5)');

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseup', up);

    return () => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
      el.removeEventListener('mousedown', down);
      el.removeEventListener('mouseup', up);
      gsap.killTweensOf(el);
    };
  }, [ref]);
}
