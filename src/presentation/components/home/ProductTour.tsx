'use client';

import { useMemo } from 'react';
import { cents, formatBRL } from '@/domain';
import { computeRoi } from '@/infrastructure/roiEngine';
import { useGodModeStore } from '@/application/stores/useGodModeStore';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { BarChart } from '@/presentation/components/charts/BarChart';
import { StatStrip } from '@/presentation/components/charts/StatStrip';
import { KanbanBoard } from '@/presentation/components/creator/KanbanBoard';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ProductFrame } from '@/presentation/components/ui/ProductFrame';
import { Tabs, type TabItem } from '@/presentation/components/ui/Tabs';
import { RoiCalculator } from './RoiCalculator';
import { DEMO_ASSUMPTIONS } from './demoAssumptions';
import { ProjectionIllustration } from './illustrations/ProjectionIllustration';

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

/**
 * A dobra que mostra o produto em vez de descrevê-lo.
 *
 * As três abas montam os componentes de verdade dos painéis — a mesma
 * calculadora, o mesmo board, o mesmo gráfico — lendo a mesma store. Quem
 * arrasta um card aqui muda o estado de demonstração e vai encontrar a campanha
 * movida ao entrar no Creator Studio: é a demonstração e a aplicação sendo a
 * mesma coisa, que é o argumento inteiro desta seção.
 */
export function ProductTour() {
  // A calculadora some quando a flag está desligada no God Mode. Sem este
  // cuidado a aba abriria uma janela vazia, que parece defeito e não escolha.
  const calculatorEnabled = useGodModeStore((s) => s.flags.roiCalculator);

  const tabs: readonly TabItem[] = [
    {
      id: 'projecao',
      label: 'Projeção de retorno',
      content: (
        <ProductFrame
          label="1MP · Projeção de retorno"
          hint={calculatorEnabled ? 'mexa nos controles' : 'desligada'}
          padding="lg"
        >
          {calculatorEnabled ? (
            <RoiCalculator embedded />
          ) : (
            <EmptyState
              title="Calculadora desligada"
              description="A flag roiCalculator está desativada no God Mode. Ligue-a em /sys-admin/god-mode para ver a projeção aqui."
            />
          )}
        </ProductFrame>
      ),
    },
    {
      id: 'board',
      label: 'Board da campanha',
      content: (
        <ProductFrame
          label="1MP · Creator Studio — campanhas"
          hint="arraste um card"
          padding="lg"
        >
          {/* Sem criador logado o board mostra a carteira inteira do ambiente —
              é o mesmo `creatorId: null` que o painel usa para visitante. */}
          <KanbanBoard creatorId={null} />
        </ProductFrame>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics de ROI',
      content: (
        <ProductFrame label="1MP · Brand Manager — analytics" hint="dados do ambiente" padding="lg">
          <PortfolioAnalytics />
        </ProductFrame>
      ),
    },
  ];

  return (
    <section id="produto" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid gap-8 md:grid-cols-[1.4fr_0.6fr] md:items-end">
        <div>
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: 'var(--violet)' }}
          >
            O produto
          </p>
          <h2 className="font-display mt-3 text-3xl leading-[1.05] font-normal tracking-tight md:text-5xl">
            Isto não é uma imagem do produto.
            <br />É o produto.
          </h2>
          <p className="mt-5 max-w-lg text-ink-muted">
            As três telas abaixo são os componentes que rodam nos painéis, montados aqui
            com os dados deste ambiente. Mexa à vontade — o que você mudar continua lá
            quando entrar.
          </p>
        </div>

        <ProjectionIllustration className="hidden w-full max-w-[220px] justify-self-end text-ink md:block" />
      </div>

      <Tabs items={tabs} className="mt-10" />
    </section>
  );
}

/**
 * Analytics de ROI da carteira inteira do ambiente.
 *
 * O painel da marca filtra por marca; aqui a home soma as duas, porque a
 * pergunta que a página responde é "como é a tela", não "como vai a Vervo".
 */
function PortfolioAnalytics() {
  const campaigns = useWorkspaceStore((s) => s.campaigns);
  const creators = useWorkspaceStore((s) => s.creators);
  const brands = useWorkspaceStore((s) => s.brands);

  const rows = useMemo(
    () =>
      Object.values(campaigns)
        .map((campaign) => {
          const creator = campaign.creatorId ? creators[campaign.creatorId] : undefined;
          if (!creator) return null;
          return {
            campaign,
            brandName: brands[campaign.brandId]?.tradeName ?? 'Marca removida',
            projection: computeRoi(
              { creator, campaign, investmentCents: campaign.offerCents },
              DEMO_ASSUMPTIONS,
            ),
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null),
    [campaigns, creators, brands],
  );

  const totals = rows.reduce(
    (acc, { projection }) => ({
      investmentCents: acc.investmentCents + projection.investmentCents,
      contributionCents: acc.contributionCents + projection.contributionCents,
      reach: acc.reach + projection.reach,
      impressions: acc.impressions + projection.impressions,
    }),
    { investmentCents: 0, contributionCents: 0, reach: 0, impressions: 0 },
  );

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sem campanhas para projetar"
        description="O ROI é calculado sobre campanhas que já têm criador atribuído. Use o One-Click Seed no God Mode para repor os dados de demonstração."
      />
    );
  }

  const roi =
    totals.investmentCents === 0
      ? 0
      : (totals.contributionCents - totals.investmentCents) / totals.investmentCents;

  const cpm =
    totals.impressions === 0 ? 0 : (totals.investmentCents / totals.impressions) * 1000;

  return (
    <div className="space-y-6">
      <StatStrip
        stats={[
          { label: 'Alcance projetado', value: compact.format(totals.reach) },
          { label: 'Investido', value: formatBRL(cents(totals.investmentCents)) },
          { label: 'CPM médio', value: formatBRL(cents(Math.round(cpm))) },
          {
            label: 'ROI da carteira',
            value: `${roi >= 0 ? '+' : ''}${(roi * 100).toFixed(0)}%`,
            tone: roi >= 0 ? 'accent' : 'signal',
          },
        ]}
      />

      <BarChart
        diverging
        caption="Retorno projetado por campanha do ambiente de demonstração, em percentual"
        valueHeader="ROI projetado"
        data={[...rows]
          .sort((a, b) => b.projection.roi - a.projection.roi)
          .map(({ campaign, brandName, projection }) => ({
            label: `${campaign.title} · ${brandName}`,
            value: projection.roi * 100,
            display: `${projection.roi >= 0 ? '+' : ''}${(projection.roi * 100).toFixed(0)}%`,
          }))}
      />
    </div>
  );
}
