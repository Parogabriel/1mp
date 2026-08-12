'use client';

import { useMemo, useState } from 'react';
import {
  totalFollowers,
  weightedEngagementRate,
  type Creator,
} from '@/domain';

export const CREATOR_SORTS = [
  { key: 'alcance-desc', label: 'Mais alcance' },
  { key: 'alcance-asc', label: 'Menos alcance' },
  { key: 'preco-desc', label: 'Mais caros' },
  { key: 'preco-asc', label: 'Mais baratos' },
  { key: 'engajamento-desc', label: 'Maior engajamento' },
  { key: 'entregas-desc', label: 'Mais campanhas' },
] as const;

export type CreatorSortKey = (typeof CREATOR_SORTS)[number]['key'];

const COMPARATORS: Readonly<Record<CreatorSortKey, (a: Creator, b: Creator) => number>> = {
  'alcance-desc': (a, b) => totalFollowers(b) - totalFollowers(a),
  'alcance-asc': (a, b) => totalFollowers(a) - totalFollowers(b),
  'preco-desc': (a, b) => b.baseRateCents - a.baseRateCents,
  'preco-asc': (a, b) => a.baseRateCents - b.baseRateCents,
  'engajamento-desc': (a, b) => weightedEngagementRate(b) - weightedEngagementRate(a),
  'entregas-desc': (a, b) => b.completedCampaigns - a.completedCampaigns,
};

/**
 * Busca, filtro por nicho e ordenação de criadores.
 *
 * Extraído do `CreatorsExplorer`, que já tinha essa lógica, para o CRM da marca
 * poder usar a mesma — em vez de a segunda tela ganhar uma cópia que sai de
 * sincronia na primeira mudança de regra.
 *
 * Os nichos saem dos próprios dados: cadastrar criador de nicho novo passa a
 * filtrá-lo sem tocar em código.
 */
export function useCreatorFilters(source: readonly Creator[]) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CreatorSortKey>('alcance-desc');
  const [niche, setNiche] = useState<string | null>(null);

  const niches = useMemo(
    () =>
      [...new Set(source.flatMap((c) => c.niches))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR'),
      ),
    [source],
  );

  const result = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = source.filter((creator) => {
      if (niche && !creator.niches.includes(niche)) return false;
      if (!term) return true;

      // Busca por nome, @ e nicho — quem procura "beleza" espera achar por aí.
      return (
        creator.displayName.toLowerCase().includes(term) ||
        creator.niches.some((n) => n.toLowerCase().includes(term)) ||
        creator.audiences.some((a) => a.handle.toLowerCase().includes(term))
      );
    });

    return [...filtered].sort(COMPARATORS[sort]);
  }, [source, query, niche, sort]);

  return {
    query,
    setQuery,
    sort,
    setSort,
    niche,
    setNiche,
    niches,
    result,
    /** `true` quando algum filtro está ativo — para oferecer "limpar". */
    isFiltered: query.trim().length > 0 || niche !== null,
    clear: () => {
      setQuery('');
      setNiche(null);
    },
  };
}
