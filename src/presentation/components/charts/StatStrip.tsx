'use client';

import { useRef } from 'react';
import { useGsapValueChange } from '@/presentation/hooks/useGsapValueChange';

export interface Stat {
  readonly label: string;
  readonly value: string;
  /** Contexto curto abaixo do número — variação, ressalva, unidade. */
  readonly hint?: string;
  readonly tone?: 'accent' | 'signal' | 'default';
}

interface StatStripProps {
  readonly stats: readonly Stat[];
  readonly className?: string;
}

const TONE_COLOR: Readonly<Record<NonNullable<Stat['tone']>, string | undefined>> = {
  accent: 'var(--accent)',
  signal: 'var(--signal)',
  default: undefined,
};

/**
 * Métricas numa faixa única, separadas por 1px.
 *
 * Substitui a grade de cards grandes: quatro cards de ~110px viravam uma parede
 * de espaço morto para exibir quatro números. Aqui a mesma informação ocupa uma
 * faixa de ~64px e continua legível.
 */
export function StatStrip({ stats, className = '' }: StatStripProps) {
  return (
    <dl
      className={`rounded-card grid gap-px overflow-hidden border-(length:--border-width) border-line sm:grid-cols-2 lg:grid-cols-4 ${className}`}
      style={{ background: 'var(--line)' }}
    >
      {stats.map((stat) => (
        <StatCell key={stat.label} stat={stat} />
      ))}
    </dl>
  );
}

function StatCell({ stat }: { readonly stat: Stat }) {
  const valueRef = useRef<HTMLElement>(null);
  // Pulsa quando o número muda — confirma que reagiu ao filtro ou ao input.
  useGsapValueChange(valueRef, stat.value);

  return (
    <div className="bg-surface-raised px-4 py-3">
      <dt className="text-[11px] tracking-widest text-ink-muted uppercase">{stat.label}</dt>
      <dd
        ref={valueRef as React.RefObject<HTMLElement>}
        className="font-display mt-1 text-xl leading-none font-normal"
        style={{ color: TONE_COLOR[stat.tone ?? 'default'] }}
      >
        {stat.value}
      </dd>
      {stat.hint && <p className="mt-1 text-[11px] text-ink-muted">{stat.hint}</p>}
    </div>
  );
}
