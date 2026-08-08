import type {
  BrandId,
  CampaignId,
  Cents,
  CreatorId,
  Platform,
  PostFormat,
} from '../value-objects';

/**
 * Estados da campanha.
 *
 * As colunas do Kanban (Propostas / Em Andamento / Concluídas) são uma *projeção*
 * destes estados — a UI agrupa, ela não define. Ver `kanbanColumnOf`.
 */
export const CAMPAIGN_STATUSES = [
  'draft',
  'proposed',
  'negotiating',
  'accepted',
  'in_production',
  'delivered',
  'paid',
  'declined',
  'cancelled',
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export type KanbanColumn = 'proposals' | 'in_progress' | 'completed';

export interface CampaignBrief {
  readonly objective: string;
  readonly keyMessage: string;
  readonly platforms: readonly Platform[];
  readonly formats: readonly PostFormat[];
  readonly deliverableCount: number;
  readonly mustMention: readonly string[];
  readonly mustAvoid: readonly string[];
}

export interface Campaign {
  readonly id: CampaignId;
  readonly brandId: BrandId;
  readonly creatorId: CreatorId | null;
  readonly title: string;
  readonly brief: CampaignBrief;
  readonly status: CampaignStatus;
  readonly offerCents: Cents;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly createdAt: Date;
}

/**
 * Transições permitidas. Tudo que não está aqui é proibido.
 *
 * Modelar como mapa explícito em vez de `if` espalhado significa que adicionar um
 * estado novo quebra o compilador nos lugares certos, em vez de passar silenciosamente.
 */
const ALLOWED_TRANSITIONS: Readonly<Record<CampaignStatus, readonly CampaignStatus[]>> = {
  draft: ['proposed', 'cancelled'],
  proposed: ['negotiating', 'accepted', 'declined'],
  negotiating: ['accepted', 'declined'],
  accepted: ['in_production', 'cancelled'],
  in_production: ['delivered', 'cancelled'],
  delivered: ['paid'],
  paid: [],
  declined: [],
  cancelled: [],
};

export const canTransition = (from: CampaignStatus, to: CampaignStatus): boolean =>
  ALLOWED_TRANSITIONS[from].includes(to);

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: CampaignStatus,
    readonly to: CampaignStatus,
  ) {
    super(`Transição inválida de "${from}" para "${to}"`);
    this.name = 'InvalidTransitionError';
  }
}

export const transitionTo = (campaign: Campaign, to: CampaignStatus): Campaign => {
  if (!canTransition(campaign.status, to)) {
    throw new InvalidTransitionError(campaign.status, to);
  }
  return { ...campaign, status: to };
};

const COLUMN_BY_STATUS: Readonly<Record<CampaignStatus, KanbanColumn>> = {
  draft: 'proposals',
  proposed: 'proposals',
  negotiating: 'proposals',
  declined: 'proposals',
  accepted: 'in_progress',
  in_production: 'in_progress',
  delivered: 'in_progress',
  paid: 'completed',
  cancelled: 'completed',
};

export const kanbanColumnOf = (campaign: Campaign): KanbanColumn =>
  COLUMN_BY_STATUS[campaign.status];

export const isTerminal = (status: CampaignStatus): boolean =>
  ALLOWED_TRANSITIONS[status].length === 0;

export const durationInDays = (campaign: Campaign): number =>
  Math.max(
    1,
    Math.ceil((campaign.endsAt.getTime() - campaign.startsAt.getTime()) / 86_400_000),
  );
