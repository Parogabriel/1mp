'use client';

import { useMemo, useState } from 'react';
import {
  formatBRL,
  toPercent,
  totalFollowers,
  weightedEngagementRate,
  tierOf,
  type Creator,
} from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { Badge } from '@/presentation/components/ui/Badge';

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

const SORTS = [
  { key: 'alcance-desc', label: 'Mais alcance' },
  { key: 'alcance-asc', label: 'Menos alcance' },
  { key: 'preco-desc', label: 'Mais caros' },
  { key: 'preco-asc', label: 'Mais baratos' },
  { key: 'engajamento-desc', label: 'Maior engajamento' },
  { key: 'entregas-desc', label: 'Mais campanhas' },
] as const;

type SortKey = (typeof SORTS)[number]['key'];

const comparators: Readonly<Record<SortKey, (a: Creator, b: Creator) => number>> = {
  'alcance-desc': (a, b) => totalFollowers(b) - totalFollowers(a),
  'alcance-asc': (a, b) => totalFollowers(a) - totalFollowers(b),
  'preco-desc': (a, b) => b.baseRateCents - a.baseRateCents,
  'preco-asc': (a, b) => a.baseRateCents - b.baseRateCents,
  'engajamento-desc': (a, b) => weightedEngagementRate(b) - weightedEngagementRate(a),
  'entregas-desc': (a, b) => b.completedCampaigns - a.completedCampaigns,
};

/**
 * Lista de criadores com ordenação e filtro por nicho.
 *
 * Os nichos saem dos próprios dados em vez de uma lista fixa: cadastrar um
 * criador de um nicho novo passa a filtrá-lo sem tocar em código.
 */
export function CreatorsExplorer() {
  const creators = useWorkspaceStore((s) => s.creators);
  const [sort, setSort] = useState<SortKey>('alcance-desc');
  const [niche, setNiche] = useState<string | null>(null);

  const all = useMemo(() => Object.values(creators), [creators]);

  const niches = useMemo(
    () => [...new Set(all.flatMap((c) => c.niches))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [all],
  );

  const list = useMemo(() => {
    const filtered = niche ? all.filter((c) => c.niches.includes(niche)) : all;
    return [...filtered].sort(comparators[sort]);
  }, [all, niche, sort]);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {SORTS.map((option) => (
          <Chip
            key={option.key}
            active={sort === option.key}
            onClick={() => setSort(option.key)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      {niches.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] tracking-widest text-ink-muted uppercase">
            Conteúdo
          </span>
          <Chip active={niche === null} onClick={() => setNiche(null)}>
            Todos
          </Chip>
          {niches.map((item) => (
            <Chip
              key={item}
              active={niche === item}
              onClick={() => setNiche(niche === item ? null : item)}
            >
              {item}
            </Chip>
          ))}
        </div>
      )}

      <ul className="mt-5 divide-y divide-line border-y-(length:--border-width) border-line">
        {list.map((creator) => (
          <li key={creator.id} className="flex items-center gap-3 py-3">
            <span
              aria-hidden="true"
              className="font-display flex size-9 shrink-0 items-center justify-center text-xs font-semibold"
              style={{
                background: 'var(--violet)',
                color: '#ffffff',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {creator.displayName.charAt(0)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {creator.displayName}
                {creator.verified && <span className="ml-1.5 text-xs">✓</span>}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {creator.niches.slice(0, 2).map((n) => (
                  <Badge key={n} tone="violet">
                    {n}
                  </Badge>
                ))}
                <span className="text-[11px] text-ink-muted">
                  {creator.location.city}
                  {creator.location.uf && `, ${creator.location.uf}`}
                </span>
              </div>
            </div>

            <dl className="hidden shrink-0 gap-5 text-right sm:flex">
              <Stat label="Alcance" value={compact.format(totalFollowers(creator))} />
              <Stat
                label="Engaj."
                value={`${toPercent(weightedEngagementRate(creator)).toFixed(1)}%`}
              />
              <Stat label="Campanha" value={formatBRL(creator.baseRateCents)} />
              <Stat label="Tier" value={tierOf(creator)} />
            </dl>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-ink-muted">
        {list.length} criador{list.length === 1 ? '' : 'es'}
        {niche ? ` em ${niche}` : ''}.
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
      className="border-(length:--border-width) border-line px-3 py-1.5 text-xs transition-colors duration-200"
      style={{
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--surface)' : 'var(--ink-muted)',
      }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd className="mt-0.5 font-mono text-xs font-medium">{value}</dd>
    </div>
  );
}
