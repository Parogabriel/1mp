import type { ReactNode } from 'react';

interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  /** Ação para sair do vazio — criar o primeiro item, limpar um filtro. */
  readonly action?: ReactNode;
  readonly compact?: boolean;
  readonly className?: string;
}

/**
 * Estado vazio padrão de listas e painéis.
 *
 * Diz o que aconteceu e, quando existe, oferece a saída — em vez do texto
 * solto "Nenhum item ainda" que estava espalhado sem ação nenhuma.
 */
export function EmptyState({
  title,
  description,
  action,
  compact = false,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-card border-(length:--border-width) border-dashed border-line text-center ${
        compact ? 'px-4 py-6' : 'px-6 py-10'
      } ${className}`}
    >
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

interface SkeletonProps {
  readonly className?: string;
}

/** Bloco de carregamento. `aria-hidden` — o container anuncia o estado. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-card bg-ink/10 ${className}`}
    />
  );
}
