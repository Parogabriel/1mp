'use client';

import { validatePost, type ScheduledPost } from '@/domain';
import {
  FORMAT_LABEL,
  PLATFORM_LABEL,
  POST_STATUS_LABEL,
  POST_STATUS_TONE,
  VERTICAL_FORMATS,
} from '@/presentation/labels';
import { Badge } from '@/presentation/components/ui/Badge';
import { issueMessage } from './postIssueMessages';

const scheduleFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

interface PostPreviewCardProps {
  readonly post: ScheduledPost;
  readonly campaignTitle: string;
}

export function PostPreviewCard({ post, campaignTitle }: PostPreviewCardProps) {
  const issues = validatePost(post);
  const vertical = VERTICAL_FORMATS.has(post.format);

  return (
    <li
      className="border-(length:--border-width) border-line bg-surface-raised p-4"
      style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard-sm)' }}
    >
      <div className="flex gap-4">
        <div
          className={`flex shrink-0 flex-col items-center justify-end overflow-hidden border-(length:--border-width) border-line p-2 ${vertical ? 'aspect-[9/16] w-20' : 'aspect-video w-32'}`}
          style={{ borderRadius: 'var(--radius)', background: 'var(--surface)' }}
          aria-hidden="true"
        >
          <span className="text-[9px] font-bold tracking-widest text-ink-muted uppercase">
            {FORMAT_LABEL[post.format]}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold tracking-tight">{campaignTitle}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            {PLATFORM_LABEL[post.platform]} · {scheduleFormatter.format(post.scheduledFor)}
          </p>
          <p className="mt-2 line-clamp-2 text-xs">
            {post.caption.trim().length > 0 ? post.caption : <em className="text-ink-muted">Sem legenda ainda.</em>}
          </p>
          <div className="mt-2">
            <Badge tone={issues.length > 0 ? 'signal' : POST_STATUS_TONE[post.status]}>
              {POST_STATUS_LABEL[post.status]}
            </Badge>
          </div>
        </div>
      </div>

      {issues.length > 0 && (
        <ul aria-live="polite" className="mt-3 space-y-1 border-t-(length:--border-width) border-line pt-2">
          {issues.map((issue) => (
            <li key={issue.kind} className="text-[11px]" style={{ color: 'var(--signal)' }}>
              {issueMessage(issue)}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
