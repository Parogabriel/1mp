import {
  type CampaignId,
  type CreatorId,
  type Platform,
  type PostFormat,
  type ScheduledPostId,
  isFormatAllowed,
} from '../value-objects';

export const POST_STATUSES = [
  'idea',
  'drafting',
  'awaiting_approval',
  'approved',
  'scheduled',
  'published',
  'failed',
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export interface ScheduledPost {
  readonly id: ScheduledPostId;
  readonly campaignId: CampaignId;
  readonly creatorId: CreatorId;
  readonly platform: Platform;
  readonly format: PostFormat;
  readonly caption: string;
  readonly hashtags: readonly string[];
  readonly scheduledFor: Date;
  readonly status: PostStatus;
  readonly publishedAt: Date | null;
}

/** Limite de caracteres por plataforma — regra da plataforma, não preferência de UI. */
export const CAPTION_LIMITS: Readonly<Record<Platform, number>> = {
  instagram: 2_200,
  tiktok: 2_200,
  youtube: 5_000,
};

export type PostValidationIssue =
  | { readonly kind: 'caption_too_long'; readonly limit: number; readonly actual: number }
  | { readonly kind: 'format_not_supported'; readonly platform: Platform; readonly format: PostFormat }
  | { readonly kind: 'scheduled_in_past'; readonly scheduledFor: Date }
  | { readonly kind: 'empty_caption' };

/**
 * Valida e retorna TODOS os problemas de uma vez.
 *
 * Retornar uma lista em vez de lançar no primeiro erro é deliberado: o criador
 * corrige tudo numa passada em vez de descobrir um problema por vez.
 */
export const validatePost = (
  post: ScheduledPost,
  now: Date = new Date(),
): readonly PostValidationIssue[] => {
  const issues: PostValidationIssue[] = [];

  const trimmed = post.caption.trim();
  if (trimmed.length === 0) {
    issues.push({ kind: 'empty_caption' });
  }

  const limit = CAPTION_LIMITS[post.platform];
  if (trimmed.length > limit) {
    issues.push({ kind: 'caption_too_long', limit, actual: trimmed.length });
  }

  if (!isFormatAllowed(post.platform, post.format)) {
    issues.push({
      kind: 'format_not_supported',
      platform: post.platform,
      format: post.format,
    });
  }

  const notYetPublished = post.status !== 'published' && post.status !== 'failed';
  if (notYetPublished && post.scheduledFor.getTime() < now.getTime()) {
    issues.push({ kind: 'scheduled_in_past', scheduledFor: post.scheduledFor });
  }

  return issues;
};

export const isPublishable = (post: ScheduledPost, now?: Date): boolean =>
  validatePost(post, now).length === 0 && post.status === 'approved';
