'use client';

import { useMemo, useState } from 'react';
import {
  CAMPAIGN_STATUSES,
  canTransition,
  kanbanColumnOf,
  kanbanColumnOfStatus,
  type CampaignId,
  type CampaignStatus,
  type CreatorId,
  type KanbanColumn,
} from '@/domain';
import { selectKanban, useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { useToast } from '@/presentation/components/ui/Toast';
import { CampaignCard } from './CampaignCard';
import { COLUMN_LABEL, STATUS_LABEL } from './campaignLabels';

const COLUMNS: readonly KanbanColumn[] = ['proposals', 'in_progress', 'completed'];

/**
 * Status que moram em cada coluna, na ordem em que devem ser tentados ao soltar.
 *
 * Derivado do domínio em vez de escrito à mão: um status novo entra na coluna
 * certa sozinho, sem esta lista sair de sincronia.
 */
const STATUSES_BY_COLUMN: Readonly<Record<KanbanColumn, readonly CampaignStatus[]>> = {
  proposals: CAMPAIGN_STATUSES.filter((s) => kanbanColumnOfStatus(s) === 'proposals'),
  in_progress: CAMPAIGN_STATUSES.filter(
    (s) => kanbanColumnOfStatus(s) === 'in_progress',
  ),
  completed: CAMPAIGN_STATUSES.filter((s) => kanbanColumnOfStatus(s) === 'completed'),
};

/**
 * Para onde a campanha vai ao ser solta numa coluna.
 *
 * A coluna agrupa vários status, então "soltar em Em andamento" é ambíguo por
 * si só. Resolve escolhendo o primeiro status daquela coluna que a máquina de
 * transição aceita a partir do estado atual — `null` quando nenhum aceita.
 */
function dropTargetFor(from: CampaignStatus, column: KanbanColumn): CampaignStatus | null {
  return STATUSES_BY_COLUMN[column].find((to) => canTransition(from, to)) ?? null;
}

interface KanbanBoardProps {
  readonly creatorId: CreatorId | null;
}

export function KanbanBoard({ creatorId }: KanbanBoardProps) {
  const campaigns = useWorkspaceStore((s) => s.campaigns);
  const brands = useWorkspaceStore((s) => s.brands);
  const moveCampaign = useWorkspaceStore((s) => s.moveCampaign);
  const toast = useToast();

  const [dragging, setDragging] = useState<CampaignId | null>(null);
  const [hovered, setHovered] = useState<KanbanColumn | null>(null);

  const kanban = useMemo(() => selectKanban(campaigns, creatorId), [campaigns, creatorId]);
  const isEmpty = COLUMNS.every((column) => kanban[column].length === 0);

  const draggedCampaign = dragging ? campaigns[dragging] : undefined;

  const drop = (column: KanbanColumn) => {
    setHovered(null);
    const campaign = draggedCampaign;
    setDragging(null);
    if (!campaign) return;

    if (kanbanColumnOf(campaign) === column) return;

    const to = dropTargetFor(campaign.status, column);
    if (!to) {
      toast.show(
        `"${campaign.title}" não pode ir de ${STATUS_LABEL[campaign.status]} para ${COLUMN_LABEL[column]}.`,
        'error',
      );
      return;
    }

    const result = moveCampaign(campaign.id, to);
    if (result.ok) toast.show(`"${campaign.title}" → ${STATUS_LABEL[to]}.`, 'success');
    else toast.show(result.message, 'error');
  };

  if (isEmpty) {
    return (
      <EmptyState
        title="Nenhuma campanha por aqui ainda"
        description="Propostas aparecem aqui assim que uma marca te convidar. Para dados de demonstração, use o One-Click Seed no God Mode."
      />
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {COLUMNS.map((column) => {
        const headingId = `kanban-${column}`;
        const list = kanban[column];

        // Só destaca a coluna se a campanha arrastada puder de fato pousar nela.
        const accepts =
          draggedCampaign !== undefined &&
          kanbanColumnOf(draggedCampaign) !== column &&
          dropTargetFor(draggedCampaign.status, column) !== null;

        return (
          <section
            key={column}
            aria-labelledby={headingId}
            onDragOver={(e) => {
              // Sem `preventDefault` o navegador recusa o drop por padrão.
              if (!accepts) return;
              e.preventDefault();
              setHovered(column);
            }}
            onDragLeave={() => setHovered((c) => (c === column ? null : c))}
            onDrop={() => drop(column)}
            className="rounded-card p-2 transition-colors duration-200"
            style={{
              background:
                hovered === column && accepts
                  ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                  : 'transparent',
              outline:
                draggedCampaign && accepts
                  ? 'var(--border-width) dashed var(--accent)'
                  : 'var(--border-width) dashed transparent',
            }}
          >
            <h3
              id={headingId}
              className="mb-3 px-1 text-xs font-medium tracking-widest text-ink-muted uppercase"
            >
              {COLUMN_LABEL[column]}
              <span className="ml-2 tabular-nums">{list.length}</span>
            </h3>

            {list.length === 0 ? (
              <p className="px-1 text-xs text-ink-muted">Nenhuma campanha aqui.</p>
            ) : (
              <ul className="space-y-3">
                {list.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    brandName={brands[campaign.brandId]?.tradeName ?? 'Marca removida'}
                    draggable
                    isDragging={dragging === campaign.id}
                    onDragStart={() => setDragging(campaign.id)}
                    onDragEnd={() => {
                      setDragging(null);
                      setHovered(null);
                    }}
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
