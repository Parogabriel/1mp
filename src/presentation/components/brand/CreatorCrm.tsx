'use client';

import type { Brand } from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { CreatorCard } from '@/presentation/components/creator/CreatorCard';

interface CreatorCrmProps {
  readonly brand: Brand;
}

export function CreatorCrm({ brand }: CreatorCrmProps) {
  const creators = useWorkspaceStore((s) => s.creators);
  const favoriteCreator = useWorkspaceStore((s) => s.favoriteCreator);
  const unfavoriteCreator = useWorkspaceStore((s) => s.unfavoriteCreator);

  const allCreators = Object.values(creators);
  const favorites = allCreators.filter((c) => brand.favoriteCreatorIds.includes(c.id));
  const rest = allCreators.filter((c) => !brand.favoriteCreatorIds.includes(c.id));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="text-xs font-bold tracking-widest text-ink-muted uppercase">
          Favoritos ({favorites.length})
        </h3>
        {favorites.length === 0 ? (
          <p className="mt-2 text-xs text-ink-muted">Nenhum criador favoritado ainda.</p>
        ) : (
          <ul className="mt-3 grid gap-4">
            {favorites.map((creator) => (
              <li key={creator.id}>
                <CreatorCard
                  creator={creator}
                  action={{
                    label: 'Remover',
                    onClick: () => unfavoriteCreator(brand.id, creator.id),
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold tracking-widest text-ink-muted uppercase">
          Outros criadores ({rest.length})
        </h3>
        {rest.length === 0 ? (
          <p className="mt-2 text-xs text-ink-muted">Nenhum outro criador disponível.</p>
        ) : (
          <ul className="mt-3 grid gap-4">
            {rest.map((creator) => (
              <li key={creator.id}>
                <CreatorCard
                  creator={creator}
                  action={{
                    label: 'Favoritar',
                    onClick: () => favoriteCreator(brand.id, creator.id),
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
