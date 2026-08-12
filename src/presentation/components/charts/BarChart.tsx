'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChartTable, type ChartDatum } from './ChartTable';

interface BarChartProps {
  readonly data: readonly ChartDatum[];
  /** Descreve o gráfico como um todo para leitor de tela. */
  readonly caption: string;
  readonly valueHeader?: string;
  /** Valores negativos ganham eixo central em vez de crescerem só à direita. */
  readonly diverging?: boolean;
  readonly className?: string;
}

/**
 * Barras horizontais em HTML, não SVG.
 *
 * Barra horizontal é um retângulo com largura percentual — SVG aqui só traria
 * cálculo de escala e texto que não quebra. O rótulo fica fora da barra, então
 * continua legível mesmo quando o valor é minúsculo.
 *
 * Quando `diverging`, o zero fica no meio: ROI negativo cresce para a esquerda,
 * positivo para a direita, que é como se lê retorno.
 */
export function BarChart({
  data,
  caption,
  valueHeader,
  diverging = false,
  className = '',
}: BarChartProps) {
  const reduceMotion = useReducedMotion();

  const magnitudes = data.map((d) => Math.abs(d.value));
  const max = Math.max(...magnitudes, 1);

  if (data.length === 0) return null;

  return (
    <div className={className}>
      <ChartTable caption={caption} data={data} valueHeader={valueHeader} />

      <ul aria-hidden="true" className="space-y-3">
        {data.map((datum, i) => {
          const ratio = Math.abs(datum.value) / max;
          const negative = datum.value < 0;
          const color = datum.color ?? (negative ? 'var(--signal)' : 'var(--accent)');

          return (
            <li key={datum.label}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate">{datum.label}</span>
                <span className="shrink-0 tabular-nums font-medium" style={{ color }}>
                  {datum.display}
                </span>
              </div>

              <div
                className="relative mt-1.5 h-2 overflow-hidden rounded-full"
                style={{ background: 'color-mix(in srgb, var(--ink) 8%, transparent)' }}
              >
                {/* No modo divergente a barra parte do centro; senão, da esquerda. */}
                <motion.div
                  className="absolute top-0 h-full rounded-full"
                  style={{
                    background: color,
                    left: diverging ? (negative ? undefined : '50%') : 0,
                    right: diverging && negative ? '50%' : undefined,
                  }}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${ratio * (diverging ? 50 : 100)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                />
                {diverging && (
                  <span
                    className="absolute top-0 left-1/2 h-full w-px"
                    style={{ background: 'var(--line)' }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
