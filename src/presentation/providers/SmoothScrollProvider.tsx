'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  readonly children: ReactNode;
}

/**
 * Lenis global, sincronizado no ticker do GSAP em vez do próprio rAF dele.
 *
 * Sem isso, Lenis e ScrollTrigger correm em dois relógios diferentes e o scrub
 * de scroll (hero, reveal de texto) fica um frame atrás do que o usuário vê —
 * pequeno o suficiente pra não parecer "bug", grande o suficiente pra parecer
 * "travado". Rodar os dois no mesmo ticker elimina o descompasso.
 *
 * Com movimento reduzido, não monta o Lenis: a página rola nativamente, sem
 * inércia — suavizar o scroll é uma escolha estética, não algo que alguém que
 * pediu menos movimento devia receber de qualquer jeito.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => ScrollTrigger.update();
    lenisRef.current?.lenis?.on('scroll', onScroll);

    return () => {
      gsap.ticker.remove(update);
      lenisRef.current?.lenis?.off('scroll', onScroll);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        // Inércia mais longa com saída exponencial: o scroll desacelera em vez
        // de parar seco, que é o que fazia cada gesto parecer um passo travado.
        duration: 1.5,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        // Cada "clique" da roda cobre menos distância, então o movimento vira
        // deslizamento contínuo em vez de saltos.
        wheelMultiplier: 0.85,
      }}
    >
      {children}
    </ReactLenis>
  );
}
