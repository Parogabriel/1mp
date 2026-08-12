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

    /*
     * A instância é lida a cada frame, nunca capturada na entrada do efeito.
     *
     * `autoRaf` está desligado, então o Lenis só avança pelo `raf` que chamamos
     * aqui. E a ref do ReactLenis pode ainda estar vazia quando este efeito roda
     * — o componente monta no mesmo commit. Capturar `lenisRef.current` uma vez
     * deixava `lenis` como `undefined` para sempre: o Lenis engolia o wheel, a
     * página nunca rolava, e a única pista era a classe `lenis-scrolling` presa
     * no `html`. Já quebrou assim.
     *
     * `assinado` guarda de quem o listener de scroll foi pendurado, para o
     * cleanup remover do mesmo objeto em que assinou — que é o motivo real de não
     * se ler ref dentro de cleanup.
     */
    let assinado: NonNullable<LenisRef['lenis']> | null = null;
    const onScroll = () => ScrollTrigger.update();

    const update = (time: number) => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;

      if (assinado !== lenis) {
        assinado?.off('scroll', onScroll);
        lenis.on('scroll', onScroll);
        assinado = lenis;
      }

      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      assinado?.off('scroll', onScroll);
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
