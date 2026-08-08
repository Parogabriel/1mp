import type { CampaignStatus, KanbanColumn } from '@/domain';
import type { BadgeTone } from '@/presentation/components/ui/Badge';

/** Rótulo de exibição do status atual (substantivo, para badge do card). */
export const STATUS_LABEL: Readonly<Record<CampaignStatus, string>> = {
  draft: 'Rascunho',
  proposed: 'Proposta enviada',
  negotiating: 'Em negociação',
  accepted: 'Aceita',
  in_production: 'Em produção',
  delivered: 'Entregue',
  paid: 'Paga',
  declined: 'Recusada',
  cancelled: 'Cancelada',
};

/** Rótulo do botão que leva a este status (verbo de ação, não o nome do estado). */
export const ACTION_LABEL: Readonly<Record<CampaignStatus, string>> = {
  draft: 'Reabrir rascunho',
  proposed: 'Enviar proposta',
  negotiating: 'Iniciar negociação',
  accepted: 'Aceitar',
  in_production: 'Iniciar produção',
  delivered: 'Marcar como entregue',
  paid: 'Confirmar pagamento',
  declined: 'Recusar',
  cancelled: 'Cancelar',
};

export const STATUS_TONE: Readonly<Record<CampaignStatus, BadgeTone>> = {
  draft: 'amber',
  proposed: 'violet',
  negotiating: 'violet',
  accepted: 'lime',
  in_production: 'lime',
  delivered: 'amber',
  paid: 'accent',
  declined: 'signal',
  cancelled: 'signal',
};

export const COLUMN_LABEL: Readonly<Record<KanbanColumn, string>> = {
  proposals: 'Propostas',
  in_progress: 'Em andamento',
  completed: 'Concluídas',
};
