'use client';

import { useId, useState } from 'react';
import {
  CAMPAIGN_STATUSES,
  canTransition,
  formatBRL,
  isTerminal,
  type Campaign,
  type CampaignStatus,
} from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { Badge } from '@/presentation/components/ui/Badge';
import { Card } from '@/presentation/components/ui/Card';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { useToast } from '@/presentation/components/ui/Toast';
import { CampaignDetailModal } from './CampaignDetailModal';
import { ACTION_LABEL, STATUS_LABEL, STATUS_TONE } from './campaignLabels';

const dateRangeFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

interface CampaignCardProps {
  readonly campaign: Campaign;
  readonly brandName: string;
  readonly draggable?: boolean;
  readonly isDragging?: boolean;
  readonly onDragStart?: () => void;
  readonly onDragEnd?: () => void;
}

export function CampaignCard({
  campaign,
  brandName,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: CampaignCardProps) {
  const moveCampaign = useWorkspaceStore((s) => s.moveCampaign);
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<CampaignStatus | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const errorId = useId();

  const nextStatuses = CAMPAIGN_STATUSES.filter((candidate) =>
    canTransition(campaign.status, candidate),
  );

  const commit = (to: CampaignStatus) => {
    const result = moveCampaign(campaign.id, to);
    setError(result.ok ? null : result.message);
    if (result.ok) toast.show(`"${campaign.title}" → ${STATUS_LABEL[to]}.`, 'success');
    else toast.show(result.message, 'error');
  };

  // Estado terminal não tem volta: pede confirmação antes. O resto aplica direto,
  // porque confirmar tudo treina o usuário a clicar em "sim" sem ler.
  const handleMove = (to: CampaignStatus) => {
    if (isTerminal(to)) setPendingStatus(to);
    else commit(to);
  };

  return (
    <Card
      as="li"
      padding="sm"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`transition-all duration-200 hover:-translate-y-0.5 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      {/* Os botões de transição continuam sendo o caminho de teclado: arrastar
          é atalho de mouse, não o único jeito de mover a campanha. */}
      <div className="flex items-start justify-between gap-2">
        {/* O título abre o briefing. Botão, não div clicável: teclado e leitor
            de tela precisam do mesmo caminho que o mouse. */}
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="text-left text-sm font-bold tracking-tight transition-opacity duration-200 hover:opacity-70"
        >
          {campaign.title}
        </button>
        <Badge tone={STATUS_TONE[campaign.status]}>{STATUS_LABEL[campaign.status]}</Badge>
      </div>

      <p className="mt-1 text-xs text-ink-muted">{brandName}</p>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="tabular-nums text-sm font-medium" style={{ color: 'var(--accent)' }}>
          {formatBRL(campaign.offerCents)}
        </span>
        <span className="text-[11px] text-ink-muted">
          {dateRangeFormatter.format(campaign.startsAt)} – {dateRangeFormatter.format(campaign.endsAt)}
        </span>
      </div>

      {nextStatuses.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleMove(status)}
              aria-describedby={error ? errorId : undefined}
              className="border-(length:--border-width) border-line px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors hover:opacity-80"
              style={{ borderRadius: 'var(--radius-pill)' }}
            >
              {ACTION_LABEL[status]}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[11px] tracking-widest text-ink-muted uppercase">Estado final</p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[11px]" style={{ color: 'var(--signal)' }}>
          {error}
        </p>
      )}

      <CampaignDetailModal
        campaign={detailOpen ? campaign : null}
        brandName={brandName}
        onClose={() => setDetailOpen(false)}
      />

      <ConfirmDialog
        open={pendingStatus !== null}
        tone="danger"
        title={pendingStatus ? `${ACTION_LABEL[pendingStatus]} esta campanha?` : ''}
        description={
          pendingStatus
            ? `"${campaign.title}" passa para ${STATUS_LABEL[pendingStatus]}, que é um estado final — a campanha não volta atrás depois disso.`
            : ''
        }
        confirmLabel={pendingStatus ? ACTION_LABEL[pendingStatus] : 'Confirmar'}
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => {
          if (pendingStatus) commit(pendingStatus);
          setPendingStatus(null);
        }}
      />
    </Card>
  );
}
