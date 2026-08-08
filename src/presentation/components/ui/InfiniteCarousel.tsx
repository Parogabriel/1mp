'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Interpola `v` de um intervalo de entrada para um de saída, com clamp. */
function interpolate(
  v: number,
  input: readonly number[],
  output: readonly number[],
): number {
  const last = input.length - 1;
  const first = input[0] ?? 0;
  const lastIn = input[last] ?? 0;
  if (v <= first) return output[0] ?? 0;
  if (v >= lastIn) return output[last] ?? 0;

  for (let i = 0; i < last; i += 1) {
    const a = input[i];
    const b = input[i + 1];
    const oa = output[i];
    const ob = output[i + 1];
    if (a === undefined || b === undefined || oa === undefined || ob === undefined) continue;
    if (v >= a && v <= b) {
      const t = b === a ? 0 : (v - a) / (b - a);
      return oa + (ob - oa) * t;
    }
  }
  return output[last] ?? 0;
}

interface InfiniteCarouselProps<T> {
  readonly items: readonly T[];
  readonly renderItem: (params: { item: T; index: number }) => ReactNode;
  /** px por segundo do avanço automático. */
  readonly autoPlaySpeed?: number;
  /** Largura do item como fração da largura do trilho. */
  readonly itemWidthRatio?: number;
  /** Rotação máxima nas pontas, em graus. */
  readonly rotateDeg?: number;
  readonly className?: string;
}

/**
 * Carrossel infinito com avanço contínuo e arrasto.
 *
 * Cada item é posicionado por módulo sobre um trilho virtual, então a volta é
 * contínua — não há salto de "último para o primeiro". A rotação e a subida
 * dependem da posição na tela, não do índice: o item se inclina ao entrar,
 * endireita no centro e volta a inclinar ao sair.
 *
 * As posições são escritas direto no DOM a cada quadro, fora do ciclo de render
 * do React: reconciliar 60 vezes por segundo por item derrubaria a taxa.
 */
export function InfiniteCarousel<T>({
  items,
  renderItem,
  autoPlaySpeed = 34,
  itemWidthRatio = 0.34,
  rotateDeg = 1.4,
  className,
}: InfiniteCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let scroll = 0;
    let speed = reduceMotion ? 0 : autoPlaySpeed;
    let dragging = false;
    let lastPointerX = 0;
    let lastMoveTime = 0;
    let velocity = 0;
    let rafId = 0;
    let previous = performance.now();

    // Retomada suave depois do arrasto: a velocidade converge de volta ao
    // avanço automático em vez de trocar de golpe.
    let easingBack = false;

    const layout = () => {
      const trackW = track.clientWidth;
      const itemW = trackW * itemWidthRatio;
      const totalW = itemW * items.length;
      return { trackW, itemW, totalW };
    };

    const frame = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      const { trackW, itemW, totalW } = layout();
      if (totalW === 0) {
        rafId = requestAnimationFrame(frame);
        return;
      }

      if (!dragging) {
        if (easingBack) {
          // Aproximação exponencial: rápido no começo, macio no fim.
          speed += (autoPlaySpeed - speed) * Math.min(1, dt * 2.2);
          if (Math.abs(speed - autoPlaySpeed) < 0.5) {
            speed = autoPlaySpeed;
            easingBack = false;
          }
        }
        scroll += speed * dt;
      }

      // Mantém o deslocamento no primeiro ciclo para não crescer sem limite.
      scroll = ((scroll % totalW) + totalW) % totalW;

      for (let i = 0; i < items.length; i += 1) {
        const el = itemRefs.current[i];
        if (!el) continue;

        const base = itemW * i;
        let pos = (base - scroll) % totalW;
        if (pos < 0) pos += totalW;
        // Puxa para a esquerda da viewport o item que já passou, para ele
        // reaparecer pela borda oposta em vez de sumir no fim do trilho.
        if (pos > trackW) pos -= totalW;

        const rotate = interpolate(pos, [0, trackW - itemW], [-rotateDeg, rotateDeg]);
        const lift = interpolate(
          pos,
          [0, (trackW - itemW) / 2, trackW - itemW],
          [10, 0, 10],
        );

        el.style.transform = `translate3d(${pos}px, ${lift}px, 0) rotate(${rotate}deg)`;
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      easingBack = false;
      speed = 0;
      velocity = 0;
      lastPointerX = e.clientX;
      lastMoveTime = performance.now();
      track.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPointerX;
      const now = performance.now();
      const dt = Math.max((now - lastMoveTime) / 1000, 0.001);
      velocity = -dx / dt;
      scroll -= dx;
      lastPointerX = e.clientX;
      lastMoveTime = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      // Herda o impulso do gesto e desacelera de volta ao automático.
      speed = Math.max(-1200, Math.min(1200, velocity));
      easingBack = true;
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
    };

    if (!reduceMotion) {
      track.addEventListener('pointerdown', onPointerDown);
      track.addEventListener('pointermove', onPointerMove);
      track.addEventListener('pointerup', onPointerUp);
      track.addEventListener('pointercancel', onPointerUp);
    }

    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', onPointerUp);
      track.removeEventListener('pointercancel', onPointerUp);
    };
  }, [items.length, autoPlaySpeed, itemWidthRatio, rotateDeg]);

  return (
    <div
      ref={trackRef}
      className={`relative touch-pan-y overflow-hidden select-none ${className ?? ''}`}
    >
      {items.map((item, index) => (
        <div
          key={index}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          className="absolute top-0 left-0 h-full origin-bottom px-2.5"
          style={{ width: `${itemWidthRatio * 100}%` }}
        >
          {renderItem({ item, index })}
        </div>
      ))}
    </div>
  );
}
