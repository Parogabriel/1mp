'use client';

import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  CAPTION_LIMITS,
  FORMATS_BY_PLATFORM,
  PLATFORMS,
  asCampaignId,
  asScheduledPostId,
  validatePost,
  type Campaign,
  type CampaignId,
  type CreatorId,
  type Platform,
  type PostFormat,
  type ScheduledPost,
} from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { FORMAT_LABEL, PLATFORM_LABEL } from '@/presentation/labels';
import { Button } from '@/presentation/components/ui/Button';
import { useToast } from '@/presentation/components/ui/Toast';
import { issueMessage } from './postIssueMessages';

const tomorrowAt9am = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  // input[type=datetime-local] espera "YYYY-MM-DDTHH:mm" em hora local, sem timezone.
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface PostFormProps {
  readonly creatorId: CreatorId;
  readonly campaigns: readonly Campaign[];
}

export function PostForm({ creatorId, campaigns }: PostFormProps) {
  const createScheduledPost = useWorkspaceStore((s) => s.createScheduledPost);
  const toast = useToast();

  const [campaignId, setCampaignId] = useState<CampaignId | ''>('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [format, setFormat] = useState<PostFormat>('reel');
  const [caption, setCaption] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [scheduledForInput, setScheduledForInput] = useState(tomorrowAt9am);

  const formId = useId();
  const allowedFormats = FORMATS_BY_PLATFORM[platform];

  const handlePlatformChange = (next: Platform) => {
    setPlatform(next);
    if (!FORMATS_BY_PLATFORM[next].includes(format)) {
      const [firstFormat] = FORMATS_BY_PLATFORM[next];
      if (firstFormat) setFormat(firstFormat);
    }
  };

  const draftPost: ScheduledPost = useMemo(
    () => ({
      id: asScheduledPostId('form-preview'),
      campaignId: campaignId || asCampaignId('form-preview'),
      creatorId,
      platform,
      format,
      caption,
      hashtags: hashtagsInput
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean),
      scheduledFor: scheduledForInput ? new Date(scheduledForInput) : new Date(0),
      status: 'idea',
      publishedAt: null,
    }),
    [campaignId, creatorId, platform, format, caption, hashtagsInput, scheduledForInput],
  );

  const issues = validatePost(draftPost);
  const captionLimit = CAPTION_LIMITS[platform];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!campaignId) return;

    createScheduledPost({
      campaignId,
      creatorId,
      platform,
      format,
      caption,
      hashtags: draftPost.hashtags,
      scheduledFor: draftPost.scheduledFor,
    });

    setCaption('');
    setHashtagsInput('');
    toast.show('Post adicionado ao planejamento.', 'success');
  };

  if (campaigns.length === 0) {
    return (
      <p className="text-xs text-ink-muted">
        Nenhuma campanha disponível para planejar posts ainda.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-(length:--border-width) border-line bg-surface-raised p-4"
      style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard-sm)' }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Campanha" htmlFor={`${formId}-campaign`}>
          <select
            id={`${formId}-campaign`}
            value={campaignId}
            onChange={(e) => {
              setCampaignId(asCampaignId(e.target.value));
            }}
            required
            className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <option value="" disabled>
              Selecione…
            </option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Plataforma" htmlFor={`${formId}-platform`}>
          <select
            id={`${formId}-platform`}
            value={platform}
            onChange={(e) => handlePlatformChange(e.target.value as Platform)}
            className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Formato" htmlFor={`${formId}-format`}>
          <select
            id={`${formId}-format`}
            value={format}
            onChange={(e) => setFormat(e.target.value as PostFormat)}
            className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {allowedFormats.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABEL[f]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Agendar para" htmlFor={`${formId}-schedule`}>
          <input
            id={`${formId}-schedule`}
            type="datetime-local"
            value={scheduledForInput}
            onChange={(e) => setScheduledForInput(e.target.value)}
            className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Legenda" htmlFor={`${formId}-caption`}>
          <textarea
            id={`${formId}-caption`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full resize-y border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </Field>
        <p className="mt-1 text-right text-[11px] text-ink-muted">
          {caption.trim().length} / {captionLimit}
        </p>
      </div>

      <div className="mt-2">
        <Field label="Hashtags (separadas por vírgula)" htmlFor={`${formId}-hashtags`}>
          <input
            id={`${formId}-hashtags`}
            type="text"
            value={hashtagsInput}
            onChange={(e) => setHashtagsInput(e.target.value)}
            placeholder="#parceria, #rotina"
            className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </Field>
      </div>

      {issues.length > 0 && (
        <ul aria-live="polite" className="mt-3 space-y-1">
          {issues.map((issue) => (
            <li key={issue.kind} className="text-[11px]" style={{ color: 'var(--signal)' }}>
              {issueMessage(issue)}
            </li>
          ))}
        </ul>
      )}

      {/* Bloqueia com problema de validação em aberto.
          Antes só `!campaignId` travava, então dava para agendar post sem
          legenda ou com data no passado — o domínio reprovava e a UI aceitava. */}
      <Button
        type="submit"
        variant="primary"
        disabled={!campaignId || issues.length > 0}
        className="mt-4"
      >
        Adicionar ao planejamento
      </Button>

      {issues.length > 0 && campaignId && (
        <p className="mt-2 text-[11px] text-ink-muted">
          Resolva os pontos acima para agendar.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  readonly label: string;
  readonly htmlFor: string;
  readonly children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-[11px] font-bold tracking-widest text-ink-muted uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
