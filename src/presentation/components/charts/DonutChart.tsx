'use client';

import { ChartTable, type ChartDatum } from './ChartTable';

interface DonutChartProps {
  readonly data: readonly ChartDatum[];
  readonly caption: string;
  readonly size?: number;
  readonly className?: string;
}

const FALLBACK_COLORS = [
  'var(--accent)',
  'var(--violet)',
  'var(--amber)',
  'var(--signal)',
  'var(--lime)',
] as const;

/**
 * Rosca por `stroke-dasharray` num círculo.
 *
 * Cada fatia é o mesmo círculo com traço tracejado: o comprimento visível é a
 * fatia e o deslocamento a posiciona. Evita calcular caminho de arco à mão,
 * onde o caso de 100% (arco de 360°) degenera e some.
 */
export function DonutChart({ data, caption, size = 148, className = '' }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (data.length === 0 || total === 0) return null;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={`flex flex-wrap items-center gap-6 ${className}`}>
      <ChartTable caption={caption} data={data} />

      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="shrink-0 -rotate-90"
      >
        {data.map((datum, i) => {
          const share = datum.value / total;
          const dash = share * circumference;
          const element = (
            <circle
              key={datum.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={datum.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return element;
        })}
      </svg>

      <ul aria-hidden="true" className="min-w-0 flex-1 space-y-2">
        {data.map((datum, i) => (
          <li key={datum.label} className="flex items-center gap-2.5 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                background: datum.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
              }}
            />
            <span className="min-w-0 flex-1 truncate">{datum.label}</span>
            <span className="shrink-0 tabular-nums font-medium">{datum.display}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
