'use client';

import { useId, useState } from 'react';
import {
  CAPTION_LIMITS,
  FORMATS_BY_PLATFORM,
  PLATFORMS,
  validatePost,
  type Platform,
  type PostFormat,
  type ScheduledPost,
} from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { Field, Input, Select, Textarea } from '@/presentation/components/ui/Field';
import { Badge } from '@/presentation/components/ui/Badge';
import { useToast } from '@/presentation/components/ui/Toast';
import { FORMAT_LABEL, PLATFORM_LABEL } from '@/presentation/labels';
import { issueMessage } from './postIssueMessages';
import { POST_STATUS_LABEL, POST_STATUS_TONE, nextPostStatus } from './postLabels';

/** `datetime-local` quer hora local sem fuso; `toISOString` devolve UTC. */
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface PostEditorModalProps {
  /** Nunca nulo: quem chama monta o modal com `key={post.id}` e desmonta ao fechar. */
  readonly post: ScheduledPost;
  readonly onClose: () => void;
}

/**
 * Edição, avanço de status e exclusão de um post.
 *
 * `updateScheduledPost` e `removeScheduledPost` existiam na store desde o início
 * e nunca foram chamados por nenhuma tela — dava para criar um post e nunca mais
 * mexer nele.
 */
export function PostEditorModal({ post, onClose }: PostEditorModalProps) {
  const updatePost = useWorkspaceStore((s) => s.updateScheduledPost);
  const removePost = useWorkspaceStore((s) => s.removeScheduledPost);
  const toast = useToast();
  const formId = useId();

  const [platform, setPlatform] = useState<Platform>(post.platform);
  const [format, setFormat] = useState<PostFormat>(post.format);
  const [caption, setCaption] = useState(post.caption);
  const [hashtagsInput, setHashtagsInput] = useState(post.hashtags.join(', '));
  const [scheduledFor, setScheduledFor] = useState(toLocalInput(post.scheduledFor));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const hashtags = hashtagsInput
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);

  const draft: ScheduledPost = {
    ...post,
    platform,
    format,
    caption,
    hashtags,
    scheduledFor: new Date(scheduledFor),
  };

  const issues = validatePost(draft);
  const limit = CAPTION_LIMITS[platform];
  const advance = nextPostStatus(post.status);

  const save = () => {
    updatePost(post.id, { platform, format, caption, hashtags, scheduledFor: draft.scheduledFor });
    toast.show('Post atualizado.', 'success');
    onClose();
  };

  return (
    <>
      <Modal open onClose={onClose} eyebrow="Post planejado" title="Editar publicação">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={POST_STATUS_TONE[post.status]}>{POST_STATUS_LABEL[post.status]}</Badge>
          {advance && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                updatePost(post.id, { status: advance });
                toast.show(`Post movido para ${POST_STATUS_LABEL[advance]}.`, 'success');
                onClose();
              }}
            >
              Avançar para {POST_STATUS_LABEL[advance]}
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Plataforma" htmlFor={`${formId}-platform`}>
            <Select
              id={`${formId}-platform`}
              value={platform}
              onChange={(e) => {
                const next = e.target.value as Platform;
                setPlatform(next);
                // Formato incompatível vira o primeiro válido da plataforma
                // nova, senão o post nasce inválido só por trocar de rede.
                const allowed = FORMATS_BY_PLATFORM[next];
                if (!allowed.includes(format)) setFormat(allowed[0] ?? format);
              }}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Formato" htmlFor={`${formId}-format`}>
            <Select
              id={`${formId}-format`}
              value={format}
              onChange={(e) => setFormat(e.target.value as PostFormat)}
            >
              {FORMATS_BY_PLATFORM[platform].map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABEL[f]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label={`Legenda (${caption.length} / ${limit})`}
            htmlFor={`${formId}-caption`}
          >
            <Textarea
              id={`${formId}-caption`}
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Hashtags" htmlFor={`${formId}-tags`} hint="Separadas por vírgula.">
            <Input
              id={`${formId}-tags`}
              value={hashtagsInput}
              onChange={(e) => setHashtagsInput(e.target.value)}
            />
          </Field>

          <Field label="Vai ao ar em" htmlFor={`${formId}-when`}>
            <Input
              id={`${formId}-when`}
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </Field>
        </div>

        {issues.length > 0 && (
          <ul aria-live="polite" className="mt-4 space-y-1">
            {issues.map((issue) => (
              <li key={issue.kind} className="text-xs" style={{ color: 'var(--signal)' }}>
                {issueMessage(issue)}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
          <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
            Excluir
          </Button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save} disabled={issues.length > 0}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmingDelete}
        tone="danger"
        title="Excluir este post?"
        description="O post sai do planejamento e do calendário. Não há como desfazer."
        confirmLabel="Excluir"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          removePost(post.id);
          setConfirmingDelete(false);
          toast.show('Post excluído.', 'info');
          onClose();
        }}
      />
    </>
  );
}
