'use client';

import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useGsapButtonPress } from '@/presentation/hooks/useGsapButtonPress';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45';

const SIZES: Readonly<Record<ButtonSize, string>> = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
};

/**
 * Cores por variante.
 *
 * `primary` e `danger` pintam via var de tema no style inline porque
 * `--ink`/`--surface` invertem entre os temas e o par fundo/texto precisa
 * inverter junto — uma classe fixa quebraria num dos dois.
 */
const VARIANTS: Readonly<Record<ButtonVariant, string>> = {
  primary: 'hover:opacity-90',
  secondary:
    'border-(length:--border-width) border-line bg-surface-raised hover:bg-ink hover:text-surface',
  ghost: 'text-ink-muted hover:text-ink',
  danger: 'hover:opacity-90',
};

const VARIANT_STYLE: Readonly<Record<ButtonVariant, React.CSSProperties>> = {
  primary: { background: 'var(--ink)', color: 'var(--surface)' },
  secondary: {},
  ghost: {},
  danger: { background: 'var(--signal)', color: 'var(--signal-ink)' },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Bloqueia o clique e troca o rótulo por um indicador de progresso. */
  readonly loading?: boolean;
  /** Pílula (padrão) ou raio de card. */
  readonly pill?: boolean;
  readonly children: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  pill = true,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useGsapButtonPress(ref);

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      // `aria-busy` avisa leitor de tela que a ação está em curso; sem isso o
      // botão só fica inerte, sem explicar por quê.
      aria-busy={loading || undefined}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${pill ? 'rounded-full' : 'rounded-card'} ${className}`}
      style={VARIANT_STYLE[variant]}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
