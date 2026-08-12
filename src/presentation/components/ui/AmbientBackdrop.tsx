'use client';

import { HandsNetworkCanvas } from '@/presentation/components/ui/HandsNetworkCanvas';

/**
 * Fundo de página inteira: malha de traços sobre lavagens suaves de cor.
 *
 * Elegante, não técnico — nada de grid milimetrado, ícone flutuante ou brilho
 * neon. A profundidade vem de camadas difusas e do desenho de linha, que se
 * lê como gravura, não como HUD.
 *
 * `fixed` e atrás de tudo: acompanha a página inteira sem esticar a altura de
 * nenhuma seção e sem capturar ponteiro.
 */

interface Wash {
  readonly color: string;
  readonly size: string;
  readonly top: string;
  readonly left: string;
  readonly opacity: number;
  readonly delay: string;
}

/** Poucas e grandes: manchas pequenas viram bolha, e bolha não é elegante. */
const WASHES: readonly Wash[] = [
  { color: 'var(--violet)', size: '46rem', top: '-14%', left: '-12%', opacity: 0.34, delay: '0s' },
  { color: 'var(--amber)', size: '38rem', top: '22%', left: '64%', opacity: 0.26, delay: '-7s' },
  { color: 'var(--accent)', size: '42rem', top: '64%', left: '-6%', opacity: 0.2, delay: '-13s' },
];

export function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="backdrop-orbs">
        {WASHES.map((wash, i) => (
          <div
            key={i}
            className="backdrop-orb animate-orb-drift"
            style={{
              background: wash.color,
              width: wash.size,
              height: wash.size,
              top: wash.top,
              left: wash.left,
              opacity: wash.opacity,
              animationDelay: wash.delay,
            }}
          />
        ))}
      </div>

      {/* A malha corre por trás da página inteira, discreta o bastante para não
          competir com texto em nenhuma seção. */}
      {/* 0.4 → 0.25: a malha passava por trás de parágrafo inteiro e o texto
          ficava sobre linha, não sobre superfície. */}
      <HandsNetworkCanvas intensity={0.25} />
    </div>
  );
}
