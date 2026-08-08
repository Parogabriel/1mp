'use client';

import { useId, useState } from 'react';
import { CAMPAIGN_STATUSES, canTransition, formatBRL, type Campaign, type CampaignStatus } from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { Badge } from '@/presentation/components/ui/Badge';
import { ACTION_LABEL, STATUS_LABEL, STATUS_TONE } from './campaignLabels';

const dateRangeFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

interface CampaignCardProps {
  readonly campaign: Campaign;
  readonly brandName: string;
}

export function CampaignCard({ campaign, brandName }: CampaignCardProps) {
  const moveCampaign = useWorkspaceStore((s) => s.moveCampaign);
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  const nextStatuses = CAMPAIGN_STATUSES.filter((candidate) =>
    canTransition(campaign.status, candidate),
  );

  const handleMove = (to: CampaignStatus) => {
    const result = moveCampaign(campaign.id, to);
    setError(result.ok ? null : result.message);
  };

  return (
    <li
      className="border-(length:--border-width) border-line bg-surface-raised p-4"
      style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard-sm)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold tracking-tight">{campaign.title}</h3>
        <Badge tone={STATUS_TONE[campaign.status]}>{STATUS_LABEL[campaign.status]}</Badge>
      </div>

      <p className="mt-1 text-xs text-ink-muted">{brandName}</p>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>
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
              className="border-(length:--border-width) border-line px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors hover:opacity-80"
              style={{ borderRadius: 'var(--radius-pill)' }}
            >
              {ACTION_LABEL[status]}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[10px] tracking-widest text-ink-muted uppercase">Estado final</p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[11px]" style={{ color: 'var(--signal)' }}>
          {error}
        </p>
      )}
    </li>
  );
}
