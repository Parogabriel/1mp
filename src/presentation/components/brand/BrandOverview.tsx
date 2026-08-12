'use client';

import { useMemo } from 'react';
import {
  availableBudget,
  formatBRL,
  toPercent,
  totalFollowers,
  weightedEngagementRate,
  cents,
  rate,
  type Brand,
  type Campaign,
  type CampaignStatus,
  type Creator,
} from '@/domain';
import { computeRoi } from '@/infrastructure/roiEngine';
import { useWorkspaceStore, selectCampaignsByBrand } from '@/application/stores/useWorkspaceStore';
import { Card } from '@/presentation/components/ui/Card';
import { StatStrip } from '@/presentation/components/charts/StatStrip';
import { DonutChart } from '@/presentation/components/charts/DonutChart';
import { Badge } from '@/presentation/components/ui/Badge';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { STATUS_LABEL } from '@/presentation/components/creator/campaignLabels';

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

const SEGMENT_LABEL: Readonly<Record<string, string>> = {
  beauty: 'Beleza',
  fashion: 'Moda',
  food: 'Alimentação',
  fitness: 'Fitness',
  tech: 'Tecnologia',
  finance: 'Finanças',
  gaming: 'Games',
  travel: 'Viagem',
};

/** Nichos que combinam com cada segmento — base da recomendação de criadores. */
const SEGMENT_AFFINITY: Readonly<Record<string, readonly string[]>> = {
  beauty: ['beleza', 'lifestyle'],
  fashion: ['moda', 'lifestyle', 'beleza'],
  food: ['alimentação', 'lifestyle'],
  fitness: ['fitness', 'alimentação'],
  tech: ['tech', 'games'],
  finance: ['tech', 'lifestyle'],
  gaming: ['games', 'tech'],
  travel: ['lifestyle', 'viagem'],
};

interface BrandOverviewProps {
  readonly brand: Brand;
}

/**
 * Retrato da marca: dinheiro, funil de campanhas, retorno projetado e quem
 * combina com o segmento.
 *
 * Tudo derivado do que já existe na store — nenhum dado novo é inventado, em
 * linha com a regra de não mostrar campo que o domínio não tem.
 */
export function BrandOverview({ brand }: BrandOverviewProps) {
  const allCampaigns = useWorkspaceStore((s) => s.campaigns);
  const creators = useWorkspaceStore((s) => s.creators);

  const campaigns = useMemo(
    () => selectCampaignsByBrand(allCampaigns, brand.id),
    [allCampaigns, brand.id],
  );

  const byStatus = useMemo(() => {
    const counts = new Map<CampaignStatus, number>();
    for (const c of campaigns) counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [campaigns]);

  const projection = useMemo(
    () => projectPortfolio(campaigns, creators),
    [campaigns, creators],
  );

  const recommended = useMemo(
    () => recommendCreators(brand, creators),
    [brand, creators],
  );

  const available = availableBudget(brand);
  const usedRatio = brand.budgetCents === 0 ? 0 : brand.committedCents / brand.budgetCents;

  return (
    <div className="space-y-8">
      <StatStrip
        stats={[
          { label: 'Orçamento livre', value: formatBRL(available), tone: 'accent' },
          { label: 'Comprometido', value: formatBRL(brand.committedCents) },
          { label: 'Campanhas', value: String(campaigns.length) },
          {
            label: 'Alcance projetado',
            value: compact.format(projection.reach),
            hint:
              projection.covered < campaigns.length
                ? `${campaigns.length - projection.covered} sem criador`
                : undefined,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card padding="lg">
          <h3 className="font-display text-lg font-normal tracking-tight">Orçamento</h3>
          <p className="mt-1 text-xs text-ink-muted">
            {SEGMENT_LABEL[brand.segment] ?? brand.segment} · {brand.legalName}
          </p>

          {/* Barra de uso: a proporção é a informação, o número exato está ao lado. */}
          <div
            className="mt-5 h-2.5 w-full overflow-hidden rounded-full"
            role="img"
            aria-label={`${Math.round(usedRatio * 100)}% do orçamento comprometido`}
            style={{ background: 'color-mix(in srgb, var(--ink) 10%, transparent)' }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.min(100, usedRatio * 100)}%`,
                background: usedRatio > 0.85 ? 'var(--signal)' : 'var(--accent)',
              }}
            />
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <MiniStat label="Total" value={formatBRL(brand.budgetCents)} />
            <MiniStat label="Comprometido" value={formatBRL(brand.committedCents)} />
            <MiniStat label="Livre" value={formatBRL(available)} />
          </dl>

          {usedRatio > 0.85 && (
            <p className="mt-4 text-xs" style={{ color: 'var(--signal)' }}>
              Menos de 15% do orçamento livre — novas campanhas podem não caber.
            </p>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="font-display text-lg font-normal tracking-tight">
            Funil de campanhas
          </h3>
          {byStatus.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                compact
                title="Nenhuma campanha ainda"
                description="Crie o primeiro briefing para acompanhar o funil aqui."
              />
            </div>
          ) : (
            <DonutChart
              className="mt-5"
              caption="Campanhas por status"
              data={byStatus.map(([status, count]) => ({
                label: STATUS_LABEL[status],
                value: count,
                display: String(count),
              }))}
            />
          )}
        </Card>
      </div>

      <Card padding="lg">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-normal tracking-tight">
            Criadores que combinam
          </h3>
          <p className="text-xs text-ink-muted">
            Por afinidade com {SEGMENT_LABEL[brand.segment] ?? brand.segment}
          </p>
        </div>

        {recommended.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              compact
              title="Nenhum criador com nicho compatível"
              description="Todos os criadores da base estão em nichos distantes deste segmento."
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recommended.map(({ creator, matched }) => (
              <li key={creator.id} className="flex items-center gap-3 py-3">
                <span
                  aria-hidden="true"
                  className="font-display flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: 'var(--violet)', color: '#ffffff' }}
                >
                  {creator.displayName.charAt(0)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{creator.displayName}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {matched.map((niche) => (
                      <Badge key={niche} tone="accent">
                        {niche}
                      </Badge>
                    ))}
                    <span className="text-[11px] text-ink-muted">
                      {compact.format(totalFollowers(creator))} seguidores ·{' '}
                      {toPercent(weightedEngagementRate(creator)).toFixed(1)}% engaj.
                    </span>
                  </div>
                </div>

                <span className="shrink-0 tabular-nums text-xs font-medium">
                  {formatBRL(creator.baseRateCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/** Soma o alcance projetado das campanhas que já têm criador. */
function projectPortfolio(
  campaigns: readonly Campaign[],
  creators: Readonly<Record<string, Creator>>,
): { reach: number; covered: number } {
  let reach = 0;
  let covered = 0;

  for (const campaign of campaigns) {
    if (!campaign.creatorId) continue;
    const creator = creators[campaign.creatorId];
    if (!creator) continue;

    const projection = computeRoi(
      { creator, campaign, investmentCents: campaign.offerCents },
      { avgOrderValueCents: cents(18_000), contributionMargin: rate(0.35) },
    );
    reach += projection.reach;
    covered += 1;
  }

  return { reach, covered };
}

/** Criadores cujo nicho cruza com o segmento da marca, do maior alcance ao menor. */
function recommendCreators(
  brand: Brand,
  creators: Readonly<Record<string, Creator>>,
): ReadonlyArray<{ creator: Creator; matched: readonly string[] }> {
  const affinity = SEGMENT_AFFINITY[brand.segment] ?? [];

  return Object.values(creators)
    .map((creator) => ({
      creator,
      matched: creator.niches.filter((n) => affinity.includes(n)),
    }))
    .filter((entry) => entry.matched.length > 0)
    .sort((a, b) => totalFollowers(b.creator) - totalFollowers(a.creator))
    .slice(0, 5);
}


function MiniStat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd className="mt-0.5 tabular-nums text-xs font-medium">{value}</dd>
    </div>
  );
}
