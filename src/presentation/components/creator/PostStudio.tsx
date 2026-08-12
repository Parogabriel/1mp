'use client';

import { useMemo, useState } from 'react';
import { PLATFORMS, type CreatorId, type Platform, type ScheduledPost } from '@/domain';
import {
  selectCampaignsByCreator,
  selectPostsByCreator,
  useWorkspaceStore,
} from '@/application/stores/useWorkspaceStore';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Field';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { PLATFORM_LABEL } from '@/presentation/labels';
import { PostPreviewCard } from './PostPreviewCard';
import { PostForm } from './PostForm';
import { PostCalendar } from './PostCalendar';
import { PostEditorModal } from './PostEditorModal';

type View = 'lista' | 'calendario';

interface PostStudioProps {
  readonly creatorId: CreatorId | null;
}

export function PostStudio({ creatorId }: PostStudioProps) {
  const allCampaigns = useWorkspaceStore((s) => s.campaigns);
  const scheduledPosts = useWorkspaceStore((s) => s.scheduledPosts);

  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<View>('lista');
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [editing, setEditing] = useState<ScheduledPost | null>(null);

  // Ordenado por data: é uma ferramenta de agendamento, e a ordem de inserção
  // do Record não diz nada sobre quando o post vai ao ar.
  const posts = useMemo(
    () =>
      [...selectPostsByCreator(scheduledPosts, creatorId)].sort(
        (a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime(),
      ),
    [scheduledPosts, creatorId],
  );

  const campaigns = useMemo(
    () => selectCampaignsByCreator(allCampaigns, creatorId),
    [allCampaigns, creatorId],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (platform && post.platform !== platform) return false;
      if (!term) return true;
      // Busca na legenda, nas hashtags e no título da campanha — os três
      // lugares onde alguém lembra de ter escrito algo.
      return (
        post.caption.toLowerCase().includes(term) ||
        post.hashtags.some((h) => h.toLowerCase().includes(term)) ||
        (allCampaigns[post.campaignId]?.title.toLowerCase().includes(term) ?? false)
      );
    });
  }, [posts, query, platform, allCampaigns]);

  const isFiltered = query.trim().length > 0 || platform !== null;
  const clear = () => {
    setQuery('');
    setPlatform(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {creatorId && (
          <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Fechar' : '+ Novo post'}
          </Button>
        )}

        <div className="min-w-[12rem] flex-1">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por legenda, hashtag ou campanha"
            aria-label="Buscar posts"
          />
        </div>

        {/* Alternador de visão: a mesma lista, duas perguntas diferentes —
            "o que existe" e "quando cai". */}
        <div
          role="radiogroup"
          aria-label="Modo de visualização"
          className="flex rounded-full border-(length:--border-width) border-line p-0.5"
        >
          {(['lista', 'calendario'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={view === mode}
              onClick={() => setView(mode)}
              className="rounded-full px-3 py-1.5 text-xs transition-colors duration-200"
              style={{
                background: view === mode ? 'var(--ink)' : 'transparent',
                color: view === mode ? 'var(--surface)' : 'var(--ink-muted)',
              }}
            >
              {mode === 'lista' ? 'Lista' : 'Calendário'}
            </button>
          ))}
        </div>
      </div>

      {!creatorId && (
        <p className="text-xs text-ink-muted">
          Sem criador ativo — mostrando posts de todos os criadores. Planejar um post novo
          exige uma sessão de criador.
        </p>
      )}

      {showForm && creatorId && <PostForm creatorId={creatorId} campaigns={campaigns} />}

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip active={platform === null} onClick={() => setPlatform(null)}>
          Todas
        </FilterChip>
        {PLATFORMS.map((p) => (
          <FilterChip
            key={p}
            active={platform === p}
            onClick={() => setPlatform(platform === p ? null : p)}
          >
            {PLATFORM_LABEL[p]}
          </FilterChip>
        ))}
        <span className="ml-1 text-xs text-ink-muted">
          {filtered.length} post{filtered.length === 1 ? '' : 's'}
          {isFiltered && (
            <>
              {' · '}
              <button type="button" onClick={clear} className="underline hover:opacity-70">
                limpar
              </button>
            </>
          )}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={isFiltered ? 'Nenhum post com esses filtros' : 'Nenhum post planejado ainda'}
          description={
            isFiltered
              ? 'Tente outro termo ou remova o filtro de plataforma.'
              : 'Use "+ Novo post" para planejar a primeira publicação da campanha.'
          }
          action={
            isFiltered ? (
              <Button variant="secondary" size="sm" onClick={clear}>
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : view === 'calendario' ? (
        <PostCalendar posts={filtered} campaigns={allCampaigns} onSelect={setEditing} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((post) => (
            <PostPreviewCard
              key={post.id}
              post={post}
              campaignTitle={allCampaigns[post.campaignId]?.title ?? 'Campanha removida'}
              onEdit={() => setEditing(post)}
            />
          ))}
        </ul>
      )}

      {/* `key` no id do post: abrir outro post remonta o editor, e o formulário
          nasce já com os valores certos. Sem isso ele precisaria sincronizar seis
          campos num efeito a cada troca. */}
      {editing && (
        <PostEditorModal key={editing.id} post={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full border-(length:--border-width) border-line px-3 py-1.5 text-xs transition-colors duration-200"
      style={{
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--surface)' : 'var(--ink-muted)',
      }}
    >
      {children}
    </button>
  );
}
