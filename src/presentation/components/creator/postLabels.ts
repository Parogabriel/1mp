import type { PostStatus } from '@/domain';
import type { BadgeTone } from '@/presentation/components/ui/Badge';

/**
 * Rótulos dos status de post.
 *
 * O domínio define sete, mas até aqui a store só criava `idea` e nenhuma tela
 * exibia ou avançava os outros seis — por isso nunca existiu esta tabela.
 */
export const POST_STATUS_LABEL: Readonly<Record<PostStatus, string>> = {
  idea: 'Ideia',
  drafting: 'Em redação',
  awaiting_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  scheduled: 'Agendado',
  published: 'Publicado',
  failed: 'Falhou',
};

/** Verde para o que avançou, âmbar para o que espera, coral para o que quebrou. */
export const POST_STATUS_TONE: Readonly<Record<PostStatus, BadgeTone>> = {
  idea: 'violet',
  drafting: 'violet',
  awaiting_approval: 'amber',
  approved: 'lime',
  scheduled: 'accent',
  published: 'accent',
  failed: 'signal',
};

/**
 * Avanço natural de um post, na ordem do fluxo.
 *
 * `published` e `failed` são finais. Diferente de campanha, o domínio de post
 * não tem máquina de transição — esta ordem é decisão de apresentação, e é por
 * isso que mora aqui e não em `ScheduledPost.ts`.
 */
export const POST_STATUS_FLOW: readonly PostStatus[] = [
  'idea',
  'drafting',
  'awaiting_approval',
  'approved',
  'scheduled',
  'published',
];

export function nextPostStatus(current: PostStatus): PostStatus | null {
  if (current === 'failed' || current === 'published') return null;
  const index = POST_STATUS_FLOW.indexOf(current);
  return index === -1 ? null : (POST_STATUS_FLOW[index + 1] ?? null);
}
