'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Brand, Creator } from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { useCreatorFilters } from '@/presentation/hooks/useCreatorFilters';
import { CreatorCard } from '@/presentation/components/creator/CreatorCard';
import { CreatorFilterBar } from '@/presentation/components/creator/CreatorFilterBar';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Button } from '@/presentation/components/ui/Button';
import { useToast } from '@/presentation/components/ui/Toast';

interface CreatorCrmProps {
  readonly brand: Brand;
}

export function CreatorCrm({ brand }: CreatorCrmProps) {
  const creators = useWorkspaceStore((s) => s.creators);
  const favoriteCreator = useWorkspaceStore((s) => s.favoriteCreator);
  const unfavoriteCreator = useWorkspaceStore((s) => s.unfavoriteCreator);
  const toast = useToast();

  const all = useMemo(() => Object.values(creators), [creators]);
  const filters = useCreatorFilters(all);

  const favorites = filters.result.filter((c) => brand.favoriteCreatorIds.includes(c.id));
  const rest = filters.result.filter((c) => !brand.favoriteCreatorIds.includes(c.id));

  return (
    <div className="space-y-6">
      <CreatorFilterBar
        query={filters.query}
        onQuery={filters.setQuery}
        sort={filters.sort}
        onSort={filters.setSort}
        niche={filters.niche}
        onNiche={filters.setNiche}
        niches={filters.niches}
        resultCount={filters.result.length}
        isFiltered={filters.isFiltered}
        onClear={filters.clear}
      />

      {filters.result.length === 0 ? (
        <EmptyState
          title="Nenhum criador com esses filtros"
          description="Tente outro termo de busca ou remova o filtro de nicho."
          action={
            <Button variant="secondary" size="sm" onClick={filters.clear}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Column
            title="Favoritos"
            creators={favorites}
            emptyLabel="Nenhum favorito ainda — favorite para montar sua lista curta."
            actionLabel="Remover"
            onAction={(creator) => {
              unfavoriteCreator(brand.id, creator.id);
              toast.show(`${creator.displayName} saiu dos favoritos.`, 'info');
            }}
          />
          <Column
            title="Outros criadores"
            creators={rest}
            emptyLabel="Todos os criadores desta busca já são favoritos."
            actionLabel="Favoritar"
            onAction={(creator) => {
              favoriteCreator(brand.id, creator.id);
              toast.show(`${creator.displayName} entrou nos favoritos.`, 'success');
            }}
          />
        </div>
      )}
    </div>
  );
}

function Column({
  title,
  creators,
  emptyLabel,
  actionLabel,
  onAction,
}: {
  readonly title: string;
  readonly creators: readonly Creator[];
  readonly emptyLabel: string;
  readonly actionLabel: string;
  readonly onAction: (creator: Creator) => void;
}) {
  return (
    <section aria-labelledby={`crm-${title}`}>
      <h3
        id={`crm-${title}`}
        className="text-xs font-medium tracking-widest text-ink-muted uppercase"
      >
        {title} ({creators.length})
      </h3>

      {creators.length === 0 ? (
        <p className="mt-3 text-xs text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 grid gap-4">
          {/* `layout` + `layoutId` fazem o card deslizar de uma coluna à outra
              ao favoritar, em vez de sumir aqui e reaparecer lá. */}
          <AnimatePresence initial={false} mode="popLayout">
            {creators.map((creator) => (
              <motion.li
                key={creator.id}
                layout
                layoutId={`crm-card-${creator.id}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                <CreatorCard
                  creator={creator}
                  action={{ label: actionLabel, onClick: () => onAction(creator) }}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
