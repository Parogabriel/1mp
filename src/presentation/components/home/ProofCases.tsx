'use client';

import { useMemo } from 'react';
import { formatBRL, type CampaignStatus } from '@/domain';
import { computeRoi } from '@/infrastructure/roiEngine';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { Badge } from '@/presentation/components/ui/Badge';
import { BlurReveal } from '@/presentation/components/ui/BlurReveal';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { STATUS_LABEL, STATUS_TONE } from '@/presentation/components/creator/campaignLabels';
import { DEMO_ASSUMPTIONS, DEMO_CONTRIBUTION_MARGIN_PERCENT } from './demoAssumptions';
import { TrailIllustration } from './illustrations/TrailIllustration';

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

/** Só campanhas que saíram do papel viram caso — proposta recusada não é resultado. */
const CASE_STATUSES: readonly CampaignStatus[] = ['paid', 'delivered', 'in_production'];

const MAX_CASES = 3;

/**
 * Casos com número — calculados, não escritos.
 *
 * A tentação aqui é inventar três estudos de caso com percentuais redondos. Em
 * vez disso, cada linha é uma campanha que existe na store, passada pelo mesmo
 * motor de ROI que o painel da marca usa. O número muda se a campanha mudar, e
 * ninguém consegue escrever um resultado que o produto não sustenta.
 *
 * A forma é lista larga, não grade de cards: a seção anterior e a seguinte já
 * são cards, e três blocos iguais em sequência apagam a hierarquia da página.
 */
export function ProofCases() {
  const campaigns = useWorkspaceStore((s) => s.campaigns);
  const creators = useWorkspaceStore((s) => s.creators);
  const brands = useWorkspaceStore((s) => s.brands);

  const cases = useMemo(
    () =>
      Object.values(campaigns)
        .filter((campaign) => CASE_STATUSES.includes(campaign.status))
        .map((campaign) => {
          const creator = campaign.creatorId ? creators[campaign.creatorId] : undefined;
          if (!creator) return null;
          return {
            campaign,
            creator,
            brandName: brands[campaign.brandId]?.tradeName ?? 'Marca removida',
            projection: computeRoi(
              { creator, campaign, investmentCents: campaign.offerCents },
              DEMO_ASSUMPTIONS,
            ),
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null)
        .sort((a, b) => b.projection.roi - a.projection.roi)
        .slice(0, MAX_CASES),
    [campaigns, creators, brands],
  );

  return (
    <section id="casos" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-xl">
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: 'var(--violet)' }}
          >
            Casos do ambiente
          </p>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] font-normal tracking-tight md:text-5xl">
            Três campanhas, com a conta aberta.
          </h2>
          <p className="mt-5 text-ink-muted">
            Cada número abaixo sai do mesmo motor que roda no painel, sobre as campanhas
            que existem neste ambiente — nada foi digitado à mão.
          </p>
        </div>

        <TrailIllustration className="hidden w-full max-w-[200px] text-ink lg:block" />
      </div>

      {cases.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="Nenhuma campanha em andamento neste ambiente"
          description="Os casos são lidos das campanhas da store. Use o One-Click Seed no God Mode para repor os dados de demonstração."
        />
      ) : (
        <ol className="mt-12 border-t-(length:--border-width) border-line">
          {cases.map(({ campaign, creator, brandName, projection }, i) => (
            /* O BlurReveal fica DENTRO do `li`: envolvendo-o, o `motion.div` viraria
               filho direto do `ol`, o que não é HTML válido. */
            <li key={campaign.id} className="border-b-(length:--border-width) border-line">
              <BlurReveal
                delay={i * 0.07}
                className="grid gap-6 py-8 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10"
              >
                <p
                  className="font-display text-5xl leading-none font-light tabular-nums md:w-40 md:text-6xl"
                  style={{
                    color: projection.roi >= 0 ? 'var(--accent)' : 'var(--signal)',
                  }}
                >
                  {projection.roi >= 0 ? '+' : ''}
                  {(projection.roi * 100).toFixed(0)}
                  <span className="text-2xl md:text-3xl">%</span>
                </p>

                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-xl font-normal tracking-tight">
                      {campaign.title}
                    </h3>
                    <Badge tone={STATUS_TONE[campaign.status]}>
                      {STATUS_LABEL[campaign.status]}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    {brandName} × {creator.displayName} · {campaign.brief.deliverableCount}{' '}
                    entregas em {campaign.brief.platforms.join(', ')}
                  </p>
                </div>

                <dl className="grid grid-cols-3 gap-6 md:gap-8 md:text-right">
                  <CaseMetric label="Investido" value={formatBRL(campaign.offerCents)} />
                  <CaseMetric label="Alcance" value={compact.format(projection.reach)} />
                  <CaseMetric label="CPM" value={formatBRL(projection.cpmCents)} />
                </dl>
              </BlurReveal>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-8 text-xs text-ink-muted">
        Projeção sobre margem de contribuição de {DEMO_CONTRIBUTION_MARGIN_PERCENT}%, não
        sobre receita bruta. Campanhas e marcas são fictícias, deste ambiente de
        demonstração.
      </p>
    </section>
  );
}

function CaseMetric({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd className="mt-1 tabular-nums text-sm font-medium">{value}</dd>
    </div>
  );
}
