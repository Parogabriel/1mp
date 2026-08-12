'use client';

import { formatBRL, availableBudget } from '@/domain';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { RequireRole } from '@/presentation/components/auth/RequireRole';
import { AppShell } from '@/presentation/components/layout/AppShell';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { BrandOverview } from '@/presentation/components/brand/BrandOverview';
import { NewCampaignLauncher } from '@/presentation/components/brand/NewCampaignLauncher';
import { CreatorCrm } from '@/presentation/components/brand/CreatorCrm';
import { RoiAnalytics } from '@/presentation/components/brand/RoiAnalytics';
import { BrandSettings } from '@/presentation/components/brand/BrandSettings';

export function BrandDashboardScreen() {
  return (
    <RequireRole role="brand">
      <BrandDashboard />
    </RequireRole>
  );
}

function BrandDashboard() {
  const session = useAuthStore((s) => s.session);
  const brands = useWorkspaceStore((s) => s.brands);

  // Depois do gate a sessão é sempre de marca, então o id existe. O fallback
  // para "primeira marca" saiu de propósito: ele deixava um criador ver o
  // orçamento de uma marca qualquer.
  const brand = session.brandId ? brands[session.brandId] : undefined;

  return (
    <AppShell
      eyebrow="Brand Manager"
      title="Do briefing ao retorno."
      primaryAction={brand && <NewCampaignLauncher brand={brand} />}
      subtitle={
        brand && (
          <>
            Orçamento disponível{' '}
            <span className="tabular-nums font-medium" style={{ color: 'var(--accent)' }}>
              {formatBRL(availableBudget(brand))}
            </span>{' '}
            de {formatBRL(brand.budgetCents)}
          </>
        )
      }
    >
      {!brand ? (
        <div className="mt-12">
          <EmptyState
            title="Nenhuma marca carregada nesta sessão"
            description="Os dados de demonstração podem ter sido limpos. Use o One-Click Seed no God Mode para repovoar o workspace."
          />
        </div>
      ) : (
        <Tabs
          className="mt-10"
          items={[
            {
              id: 'visao',
              label: 'Visão geral',
              content: <BrandOverview brand={brand} />,
            },
            {
              id: 'crm',
              label: 'Criadores',
              content: <CreatorCrm brand={brand} />,
            },
            {
              id: 'roi',
              label: 'Analytics de ROI',
              content: (
                <>
                  <p className="mb-4 text-sm text-ink-muted">
                    Projeção pelo motor de ROI sobre as campanhas desta marca — margem
                    de contribuição, não receita bruta.
                  </p>
                  <RoiAnalytics brand={brand} />
                </>
              ),
            },
            {

              id: 'perfil',

              label: 'Perfil da marca',

              content: <BrandSettings brand={brand} />,

            },

          ]}
        />
      )}
    </AppShell>
  );
}
