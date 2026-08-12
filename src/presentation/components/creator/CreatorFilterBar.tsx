'use client';

import { CREATOR_SORTS, type CreatorSortKey } from '@/presentation/hooks/useCreatorFilters';
import { Input } from '@/presentation/components/ui/Field';

interface CreatorFilterBarProps {
  readonly query: string;
  readonly onQuery: (value: string) => void;
  readonly sort: CreatorSortKey;
  readonly onSort: (value: CreatorSortKey) => void;
  readonly niche: string | null;
  readonly onNiche: (value: string | null) => void;
  readonly niches: readonly string[];
  readonly resultCount: number;
  readonly isFiltered: boolean;
  readonly onClear: () => void;
}

/**
 * Controles de busca, ordenação e nicho.
 *
 * Separado do hook e da lista para que o CRM da marca e o explorador da home
 * compartilhem tanto a lógica quanto a aparência dos controles.
 */
export function CreatorFilterBar({
  query,
  onQuery,
  sort,
  onSort,
  niche,
  onNiche,
  niches,
  resultCount,
  isFiltered,
  onClear,
}: CreatorFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[12rem] flex-1">
          <Input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar por nome, @ ou nicho"
            aria-label="Buscar criadores"
          />
        </div>

        <label className="sr-only" htmlFor="crm-sort">
          Ordenar por
        </label>
        <select
          id="crm-sort"
          value={sort}
          onChange={(e) => onSort(e.target.value as CreatorSortKey)}
          className="rounded-card border-(length:--border-width) border-line bg-surface px-3 py-2.5 text-sm"
        >
          {CREATOR_SORTS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {niches.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip active={niche === null} onClick={() => onNiche(null)}>
            Todos
          </Chip>
          {niches.map((item) => (
            <Chip
              key={item}
              active={niche === item}
              onClick={() => onNiche(niche === item ? null : item)}
            >
              {item}
            </Chip>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-muted">
        {resultCount} criador{resultCount === 1 ? '' : 'es'}
        {isFiltered && (
          <>
            {' · '}
            <button
              type="button"
              onClick={onClear}
              className="underline transition-opacity duration-200 hover:opacity-70"
            >
              limpar filtros
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full border-(length:--border-width) border-line px-3 py-1.5 text-xs transition-colors duration-200"
      style={{
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--surface)' : 'var(--ink-muted)',
      }}
    >
      {children}
    </button>
  );
}
