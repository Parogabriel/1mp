'use client';

import { useAuthStore } from '@/application/stores/useAuthStore';
import { RequireRole } from '@/presentation/components/auth/RequireRole';
import { AppShell } from '@/presentation/components/layout/AppShell';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { CreatorOverview } from '@/presentation/components/creator/CreatorOverview';
import { KanbanBoard } from '@/presentation/components/creator/KanbanBoard';
import { PostStudio } from '@/presentation/components/creator/PostStudio';

export function CreatorDashboardScreen() {
  return (
    <RequireRole role="creator">
      <CreatorDashboard />
    </RequireRole>
  );
}

/**
 * Só renderiza depois do gate, então `session.creatorId` é sempre de um
 * criador de verdade — o fallback "mostra tudo" dos seletores não vale mais aqui.
 */
function CreatorDashboard() {
  const session = useAuthStore((s) => s.session);

  return (
    <AppShell
      eyebrow="Creator Studio"
      title="Suas campanhas, na mesa."
      subtitle="Acompanhe propostas, produção e pagamento, e planeje os posts de cada campanha."
    >
      <Tabs
        className="mt-10"
        items={[
          {
            id: 'visao',
            label: 'Visão geral',
            content: <CreatorOverview creatorId={session.creatorId} />,
          },
          {
            id: 'board',
            label: 'Campanhas',
            content: <KanbanBoard creatorId={session.creatorId} />,
          },
          {
            id: 'studio',
            label: 'Post Studio',
            content: <PostStudio creatorId={session.creatorId} />,
          },
        ]}
      />
    </AppShell>
  );
}
