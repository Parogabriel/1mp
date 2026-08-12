'use client';

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  readonly children: ReactNode;
}

const CONSULTA = '(prefers-reduced-motion: reduce)';

/**
 * `matchMedia` é estado externo, então é lido por `useSyncExternalStore` em vez
 * de `useState` mais efeito. Além de dispensar o setState síncrono no efeito, isto
 * passa a acompanhar mudanças da preferência durante a sessão.
 *
 * O snapshot de servidor devolve `false`: no SSR não há `window`, e assumir que
 * há preferência de movimento reduzido faria o HTML chegar sem o Lenis para todo
 * mundo.
 */
function assinarMovimentoReduzido(onChange: () => void): () => void {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/**
 * Lenis global, sincronizado no ticker do GSAP em vez do rAF próprio dele.
 *
 * Em dois relógios diferentes, o scrub de scroll fica um frame atrás do que o
 * usuário vê — pouco para parecer bug, o bastante para parecer travado.
 *
 * Com movimento reduzido o Lenis não monta: suavizar scroll é escolha estética,
 * e quem pediu menos movimento não devia recebê-la assim mesmo.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);
  const reduzido = useSyncExternalStore(
    assinarMovimentoReduzido,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  );
  const enabled = !reduzido;

  useEffect(() => {
    if (!enabled) return;

    // A instância é capturada aqui, não lida no cleanup: `lenisRef.current` pode
    // já apontar para outra coisa quando o cleanup roda, e aí o `off` removeria
    // o listener errado. Refs são atribuídas no commit, então já está pronta.
    const lenis = lenisRef.current?.lenis;

    const update = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => ScrollTrigger.update();
    lenis?.on('scroll', onScroll);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off('scroll', onScroll);
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
