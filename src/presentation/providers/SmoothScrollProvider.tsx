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

    /*
     * Com `root: true` o Lenis mede a altura rolável contra `window`, e a única
     * fonte automática de remedição embutida nele é o evento `resize` da janela —
     * que dispara quando o VIEWPORT muda de tamanho, nunca quando o CONTEÚDO
     * cresce. Boa parte desta página só atinge a altura final depois do mount (o
     * `LiveTicker` popula linhas num efeito, por exemplo), então o Lenis media
     * 720px de página rolável — a altura da viewport no instante em que mediu —
     * e travava o scroll pra sempre com `limit.y = 0`. Um `WheelEvent` real não
     * fazia nada, e a única pista era a classe `lenis-scrolling` presa no `html`,
     * porque o Lenis registrava o gesto mas não tinha para onde rolar.
     *
     * Um `ResizeObserver` próprio em `documentElement` parecia a correção óbvia,
     * mas medido no navegador ele nunca disparou nem uma vez em três segundos —
     * nem a chamada inicial que a spec garante. Sem confiar nisso em todo
     * navegador, a correção que não depende de nenhum callback de observador é
     * chamar `resize()` a cada frame do próprio laço que já roda:
     * a leitura é barata (scrollHeight, clientHeight), o laço já existe e roda
     * enquanto a página é rolável, e a altura correta nunca fica mais de um frame
     * desatualizada, não importa a fonte do crescimento.
     */
    const update = (time: number) => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;

      if (assinado !== lenis) {
        assinado?.off('scroll', onScroll);
        lenis.on('scroll', onScroll);
        assinado = lenis;
      }

      lenis.resize();
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
