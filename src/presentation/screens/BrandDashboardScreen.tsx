'use client';

import Link from 'next/link';
import { formatBRL, availableBudget } from '@/domain';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { ThemeSwitcher } from '@/presentation/components/ui/ThemeSwitcher';
import { AmbientBackdrop } from '@/presentation/components/ui/AmbientBackdrop';
import { BriefWizard } from '@/presentation/components/brand/BriefWizard';
import { CreatorCrm } from '@/presentation/components/brand/CreatorCrm';
import { RoiAnalytics } from '@/presentation/components/brand/RoiAnalytics';

export function BrandDashboardScreen() {
  const session = useAuthStore((s) => s.session);
  const brands = useWorkspaceStore((s) => s.brands);

  // Sem sessão de marca (demo), cai na primeira marca disponível em vez de tela vazia.
  const brand = session.brandId ? brands[session.brandId] : Object.values(brands)[0];

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-10">
      <AmbientBackdrop />

      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-sm font-bold tracking-tighter">
          1MP<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <nav className="flex items-center gap-3">
          <span className="text-xs text-ink-muted">
            {brand ? brand.tradeName : 'Modo demonstração'}
          </span>
          <ThemeSwitcher />
        </nav>
      </header>

      <div className="mt-10">
        <p
          className="font-mono text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--signal)' }}
        >
          Brand Manager
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tighter md:text-5xl">
          Do briefing ao retorno.
        </h1>
        {brand && (
          <p className="mt-3 text-sm text-ink-muted">
            Orçamento disponível:{' '}
            <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
              {formatBRL(availableBudget(brand))}
            </span>{' '}
            de {formatBRL(brand.budgetCents)}
          </p>
        )}
      </div>

      {!brand ? (
        <p
          className="mt-10 border-(length:--border-width) border-line bg-surface-raised p-6 text-sm text-ink-muted"
          style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
        >
          Nenhuma marca carregada. Use o One-Click Seed no God Mode para popular dados de
          demonstração.
        </p>
      ) : (
        <>
          <section aria-labelledby="wizard-heading" className="mt-12">
            <h2 id="wizard-heading" className="text-lg font-bold tracking-tight">
              Novo briefing
            </h2>
            <div className="mt-4">
              <BriefWizard brand={brand} />
            </div>
          </section>

          <section aria-labelledby="crm-heading" className="mt-16">
            <h2 id="crm-heading" className="text-lg font-bold tracking-tight">
              CRM de criadores
            </h2>
            <div className="mt-4">
              <CreatorCrm brand={brand} />
            </div>
          </section>

          <section aria-labelledby="analytics-heading" className="mt-16">
            <h2 id="analytics-heading" className="text-lg font-bold tracking-tight">
              Analytics de ROI
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Projeção pelo motor de ROI sobre as campanhas desta marca — margem de contribuição,
              não receita bruta.
            </p>
            <div className="mt-4">
              <RoiAnalytics brand={brand} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
