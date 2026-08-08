import type { Platform, PostFormat, PostStatus } from '@/domain';
import type { BadgeTone } from '@/presentation/components/ui/Badge';

export const PLATFORM_LABEL: Readonly<Record<Platform, string>> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

export const FORMAT_LABEL: Readonly<Record<PostFormat, string>> = {
  reel: 'Reel',
  story: 'Story',
  feed: 'Feed',
  short: 'Short',
  video: 'Vídeo',
};

export const POST_STATUS_LABEL: Readonly<Record<PostStatus, string>> = {
  idea: 'Ideia',
  drafting: 'Rascunho',
  awaiting_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  scheduled: 'Agendado',
  published: 'Publicado',
  failed: 'Falhou',
};

export const POST_STATUS_TONE: Readonly<Record<PostStatus, BadgeTone>> = {
  idea: 'amber',
  drafting: 'violet',
  awaiting_approval: 'violet',
  approved: 'lime',
  scheduled: 'lime',
  published: 'accent',
  failed: 'signal',
};

/** Formatos verticais (9:16) ganham moldura de Reel/Story; os demais, 16:9. */
export const VERTICAL_FORMATS: ReadonlySet<PostFormat> = new Set(['reel', 'story', 'short']);
