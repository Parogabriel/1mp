'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface RevealTextProps {
  readonly text: string;
  readonly className?: string;
}

/**
 * Revela o texto palavra por palavra conforme entra na viewport, rolando.
 *
 * Renderiza um `<span>` — o chamador decide a tag real (h1/h2/p) por fora,
 * porque tipar uma tag dinâmica com ref específico por elemento (h2 vs p têm
 * `HTMLElement` concretos diferentes) empurraria pra `any` em algum ponto, e
 * a regra do projeto é sem `any`. Um span inline dentro do heading resolve
 * sem esse custo.
 *
 * Máscara + translateY (não só opacity): a palavra "sobe" de dentro de uma
 * moldura que corta o excesso — helpshows mais intencional que um fade puro,
 * e é o que o material de referência do usuário pedia.
 */
export function RevealText({ text, className }: RevealTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wordEls = el.querySelectorAll('.word-reveal-word');
    const tween = gsap.fromTo(
      wordEls,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.045,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [text]);

  return (
    <span ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span key={i} className="word-reveal-mask">
          <span className="word-reveal-word">{word}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}
