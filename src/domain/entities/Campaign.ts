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

/**
 * Um degrau do histórico: quando a campanha entrou neste status.
 *
 * `from` é `null` só no primeiro registro, o nascimento em `draft` — não houve
 * estado anterior de onde vir.
 */
export interface CampaignEvent {
  readonly from: CampaignStatus | null;
  readonly to: CampaignStatus;
  readonly at: Date;
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
  /**
   * Trilha de mudanças de status, da mais antiga para a mais recente.
   *
   * Sem isto não havia como saber *quando* uma campanha mudou de estado —
   * só o estado atual era guardado. Destrava linha do tempo, tempo médio por
   * etapa e auditoria de quem esperou o quê.
   */
  readonly history: readonly CampaignEvent[];
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

export const transitionTo = (
  campaign: Campaign,
  to: CampaignStatus,
  at: Date = new Date(),
): Campaign => {
  if (!canTransition(campaign.status, to)) {
    throw new InvalidTransitionError(campaign.status, to);
  }
  // O registro nasce junto da transição, não num passo separado: assim é
  // impossível mudar de estado e esquecer de anotar.
  return {
    ...campaign,
    status: to,
    history: [...campaign.history, { from: campaign.status, to, at }],
  };
};

/**
 * Quanto tempo a campanha passou em cada status por onde já andou.
 *
 * O status atual conta até agora; os anteriores contam até a transição que os
 * encerrou. Status visitado mais de uma vez soma os períodos.
 */
export const timeInStatus = (
  campaign: Campaign,
  now: Date = new Date(),
): Readonly<Partial<Record<CampaignStatus, number>>> => {
  const totals: Partial<Record<CampaignStatus, number>> = {};

  for (let i = 0; i < campaign.history.length; i += 1) {
    const event = campaign.history[i];
    if (!event) continue;
    const next = campaign.history[i + 1];
    const until = next ? next.at.getTime() : now.getTime();
    totals[event.to] = (totals[event.to] ?? 0) + Math.max(0, until - event.at.getTime());
  }

  return totals;
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

/** Coluna a partir do status isolado — útil antes de existir uma campanha. */
export const kanbanColumnOfStatus = (status: CampaignStatus): KanbanColumn =>
  COLUMN_BY_STATUS[status];

export const kanbanColumnOf = (campaign: Campaign): KanbanColumn =>
  kanbanColumnOfStatus(campaign.status);

export const isTerminal = (status: CampaignStatus): boolean =>
  ALLOWED_TRANSITIONS[status].length === 0;

export const durationInDays = (campaign: Campaign): number =>
  Math.max(
    1,
    Math.ceil((campaign.endsAt.getTime() - campaign.startsAt.getTime()) / 86_400_000),
  );
