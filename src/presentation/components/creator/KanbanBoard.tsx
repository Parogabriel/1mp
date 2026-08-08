'use client';

import { useMemo } from 'react';
import type { CreatorId, KanbanColumn } from '@/domain';
import { selectKanban, useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { CampaignCard } from './CampaignCard';
import { COLUMN_LABEL } from './campaignLabels';

const COLUMNS: readonly KanbanColumn[] = ['proposals', 'in_progress', 'completed'];

interface KanbanBoardProps {
  readonly creatorId: CreatorId | null;
}

export function KanbanBoard({ creatorId }: KanbanBoardProps) {
  const campaigns = useWorkspaceStore((s) => s.campaigns);
  const brands = useWorkspaceStore((s) => s.brands);
  const kanban = useMemo(() => selectKanban(campaigns, creatorId), [campaigns, creatorId]);

  const isEmpty = COLUMNS.every((column) => kanban[column].length === 0);

  if (isEmpty) {
    return (
      <p className="border-(length:--border-width) border-line bg-surface-raised p-6 text-sm text-ink-muted"
        style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
      >
        Nenhuma campanha por aqui ainda. Use o One-Click Seed no God Mode para popular dados
        de demonstração.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {COLUMNS.map((column) => {
        const headingId = `kanban-${column}`;
        const campaigns = kanban[column];
        return (
          <section key={column} aria-labelledby={headingId}>
            <h3
              id={headingId}
              className="mb-3 text-xs font-bold tracking-widest uppercase text-ink-muted"
            >
              {COLUMN_LABEL[column]}
              <span className="ml-2 font-mono">{campaigns.length}</span>
            </h3>
            {campaigns.length === 0 ? (
              <p className="text-xs text-ink-muted">Nenhuma campanha aqui.</p>
            ) : (
              <ul className="space-y-3">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    brandName={brands[campaign.brandId]?.tradeName ?? 'Marca removida'}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
