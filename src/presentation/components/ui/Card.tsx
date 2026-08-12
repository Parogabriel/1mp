import type { DragEventHandler, ElementType, FormEventHandler, ReactNode } from 'react';

interface CardProps {
  readonly children: ReactNode;
  readonly draggable?: boolean;
  readonly onDragStart?: DragEventHandler;
  readonly onDragEnd?: DragEventHandler;
  /** Só faz sentido com `as="form"`. */
  readonly onSubmit?: FormEventHandler;
  /** `raised` tem sombra maior — para blocos que flutuam sobre o fundo. */
  readonly elevation?: 'flat' | 'sm' | 'raised';
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Tag renderizada; use `li`, `article` ou `section` conforme o contexto. */
  readonly as?: ElementType;
  readonly className?: string;
}

const ELEVATIONS: Readonly<Record<NonNullable<CardProps['elevation']>, string>> = {
  flat: '',
  sm: 'shadow-lift-sm',
  raised: 'shadow-lift',
};

const PADDINGS: Readonly<Record<NonNullable<CardProps['padding']>, string>> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

/**
 * A superfície padrão da aplicação: borda de 1px na cor de linha do tema,
 * fundo elevado e raio do card.
 *
 * Substitui a receita que estava repetida ~15 vezes em estilo inline. Depende
 * dos utilitários `rounded-card` / `shadow-lift*` expostos no `@theme` de
 * globals.css.
 */
export function Card({
  children,
  elevation = 'sm',
  padding = 'md',
  as: Tag = 'div',
  className = '',
  draggable,
  onDragStart,
  onDragEnd,
  onSubmit,
}: CardProps) {
  return (
    <Tag
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onSubmit={onSubmit}
      className={`rounded-card border-(length:--border-width) border-line bg-surface-raised ${ELEVATIONS[elevation]} ${PADDINGS[padding]} ${className}`}
    >
      {children}
    </Tag>
  );
}
