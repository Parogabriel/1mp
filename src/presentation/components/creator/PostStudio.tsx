'use client';

import { useMemo, useState } from 'react';
import type { CreatorId } from '@/domain';
import {
  selectCampaignsByCreator,
  selectPostsByCreator,
  useWorkspaceStore,
} from '@/application/stores/useWorkspaceStore';
import { PostPreviewCard } from './PostPreviewCard';
import { PostForm } from './PostForm';

interface PostStudioProps {
  readonly creatorId: CreatorId | null;
}

export function PostStudio({ creatorId }: PostStudioProps) {
  const allCampaigns = useWorkspaceStore((s) => s.campaigns);
  const scheduledPosts = useWorkspaceStore((s) => s.scheduledPosts);
  const [showForm, setShowForm] = useState(false);

  const posts = useMemo(
    () => selectPostsByCreator(scheduledPosts, creatorId),
    [scheduledPosts, creatorId],
  );
  const campaigns = useMemo(
    () => selectCampaignsByCreator(allCampaigns, creatorId),
    [allCampaigns, creatorId],
  );

  return (
    <div className="space-y-4">
      {creatorId ? (
        <div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            aria-expanded={showForm}
            className="border-(length:--border-width) border-line px-4 py-2 text-xs font-bold tracking-widest uppercase"
            style={{ borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-hard-sm)' }}
          >
            {showForm ? 'Fechar' : '+ Novo post'}
          </button>
          {showForm && (
            <div className="mt-3">
              <PostForm creatorId={creatorId} campaigns={campaigns} />
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-ink-muted">
          Sem criador ativo — mostrando posts de todos os criadores. Planejar um post novo exige
          uma sessão de criador.
        </p>
      )}

      {posts.length === 0 ? (
        <p
          className="border-(length:--border-width) border-line bg-surface-raised p-6 text-sm text-ink-muted"
          style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
        >
          Nenhum post planejado ainda.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {posts.map((post) => (
            <PostPreviewCard
              key={post.id}
              post={post}
              campaignTitle={allCampaigns[post.campaignId]?.title ?? 'Campanha removida'}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
