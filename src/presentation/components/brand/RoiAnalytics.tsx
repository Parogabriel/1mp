'use client';

import { useId, useMemo, useState } from 'react';
import { cents, formatBRL, fromBRL, fromPercent, type Brand } from '@/domain';
import { computeRoi } from '@/infrastructure/roiEngine';
import { selectCampaignsByBrand, useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { Card } from '@/presentation/components/ui/Card';
import { StatStrip } from '@/presentation/components/charts/StatStrip';
import { BarChart } from '@/presentation/components/charts/BarChart';

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

interface RoiAnalyticsProps {
  readonly brand: Brand;
}

export function RoiAnalytics({ brand }: RoiAnalyticsProps) {
  const allCampaigns = useWorkspaceStore((s) => s.campaigns);
  const creators = useWorkspaceStore((s) => s.creators);

  const [avgOrderValue, setAvgOrderValue] = useState(180);
  const [contributionMargin, setContributionMargin] = useState(35);

  const rows = useMemo(() => {
    const assumptions = {
      avgOrderValueCents: fromBRL(avgOrderValue),
      contributionMargin: fromPercent(contributionMargin),
    };
    return selectCampaignsByBrand(allCampaigns, brand.id)
      .filter((campaign) => campaign.creatorId !== null)
      .map((campaign) => {
        const creator = campaign.creatorId ? creators[campaign.creatorId] : undefined;
        if (!creator) return null;
        const projection = computeRoi(
          { creator, campaign, investmentCents: campaign.offerCents },
          assumptions,
        );
        return { campaign, creator, projection };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }, [allCampaigns, brand.id, creators, avgOrderValue, contributionMargin]);

  const totals = rows.reduce(
    (acc, { projection }) => ({
      investmentCents: acc.investmentCents + projection.investmentCents,
      contributionCents: acc.contributionCents + projection.contributionCents,
      reach: acc.reach + projection.reach,
      impressions: acc.impressions + projection.impressions,
      conversions: acc.conversions + projection.conversions,
    }),
    { investmentCents: 0, contributionCents: 0, reach: 0, impressions: 0, conversions: 0 },
  );

  const totalRoi =
    totals.investmentCents === 0
      ? 0
      : (totals.contributionCents - totals.investmentCents) / totals.investmentCents;

  // ROAS sobre contribuição, coerente com o resto do motor — receita bruta
  // infla o número e engana quem decide.
  const totalRoas =
    totals.investmentCents === 0 ? 0 : totals.contributionCents / totals.investmentCents;

  // CPM da carteira: custo total sobre mil impressões, não a média das médias
  // (que pesaria igual uma campanha grande e uma pequena).
  const avgCpm =
    totals.impressions === 0 ? 0 : (totals.investmentCents / totals.impressions) * 1000;

  // Campanhas sem criador ficam fora da projeção; antes sumiam em silêncio.
  const excluded = useMemo(
    () => selectCampaignsByBrand(allCampaigns, brand.id).filter((c) => !c.creatorId).length,
    [allCampaigns, brand.id],
  );

  if (rows.length === 0) {
    return (
      <p className="text-xs text-ink-muted">
        Nenhuma campanha com criador atribuído ainda — o ROI é projetado a partir de campanhas
        que já têm um criador definido.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <AssumptionSlider
          label="Ticket médio"
          value={avgOrderValue}
          min={20}
          max={2_000}
          step={10}
          format={(v) => formatBRL(fromBRL(v))}
          onChange={setAvgOrderValue}
        />
        <AssumptionSlider
          label="Margem de contribuição"
          value={contributionMargin}
          min={5}
          max={80}
          step={1}
          format={(v) => `${v}%`}
          onChange={setContributionMargin}
        />
      </div>

      {/* Sete métricas em vez de três: o motor calcula doze e a tela mostrava
          um quarto delas. Impressões, CPM, conversões e ROAS já vinham prontos. */}
      <StatStrip
        stats={[
          { label: 'Alcance', value: compact.format(totals.reach) },
          { label: 'Impressões', value: compact.format(totals.impressions) },
          { label: 'Investido', value: formatBRL(cents(totals.investmentCents)) },
          { label: 'Contribuição', value: formatBRL(cents(totals.contributionCents)) },
          { label: 'Conversões', value: compact.format(totals.conversions) },
          { label: 'CPM médio', value: formatBRL(cents(Math.round(avgCpm))) },
          { label: 'ROAS', value: `${totalRoas.toFixed(2)}×` },
          {
            label: 'ROI do portfólio',
            value: `${totalRoi >= 0 ? '+' : ''}${(totalRoi * 100).toFixed(0)}%`,
            tone: totalRoi >= 0 ? 'accent' : 'signal',
          },
        ]}
      />

      <Card padding="lg">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-normal tracking-tight">
            ROI por campanha
          </h3>
          {excluded > 0 && (
            <p className="text-xs text-ink-muted">
              {excluded} campanha{excluded === 1 ? '' : 's'} fora do gráfico por não ter
              criador atribuído
            </p>
          )}
        </div>

        <BarChart
          className="mt-5"
          diverging
          caption="Retorno projetado por campanha, em percentual"
          valueHeader="ROI projetado"
          data={[...rows]
            .sort((a, b) => b.projection.roi - a.projection.roi)
            .map(({ campaign, projection }) => ({
              label: campaign.title,
              value: projection.roi * 100,
              display: `${projection.roi >= 0 ? '+' : ''}${(projection.roi * 100).toFixed(0)}%`,
            }))}
        />
      </Card>

      <Card padding="none">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Detalhe por campanha</caption>
          <thead>
            <tr className="border-b-(length:--border-width) border-line">
              <Th>Campanha</Th>
              <Th>Criador</Th>
              <Th align="right">Alcance</Th>
              <Th align="right">CPM</Th>
              <Th align="right">Conversões</Th>
              <Th align="right">ROI</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ campaign, creator, projection }) => (
              <tr key={campaign.id}>
                <Td>
                  <span className="font-medium">{campaign.title}</span>
                </Td>
                <Td>{creator.displayName}</Td>
                <Td align="right">{compact.format(projection.reach)}</Td>
                <Td align="right">{formatBRL(projection.cpmCents)}</Td>
                <Td align="right">{compact.format(projection.conversions)}</Td>
                <Td align="right">
                  <span
                    className="tabular-nums font-medium"
                    style={{
                      color: projection.roi >= 0 ? 'var(--accent)' : 'var(--signal)',
                    }}
                  >
                    {projection.roi >= 0 ? '+' : ''}
                    {(projection.roi * 100).toFixed(0)}%
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Th({
  children,
  align = 'left',
}: {
  readonly children: React.ReactNode;
  readonly align?: 'left' | 'right';
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-2.5 text-[11px] font-medium tracking-widest text-ink-muted uppercase ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
}: {
  readonly children: React.ReactNode;
  readonly align?: 'left' | 'right';
}) {
  return (
    <td className={`px-4 py-2.5 ${align === 'right' ? 'text-right' : ''}`}>{children}</td>
  );
}


interface AssumptionSliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly format: (v: number) => string;
  readonly onChange: (v: number) => void;
}

function AssumptionSlider({ label, value, min, max, step, format, onChange }: AssumptionSliderProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-bold tracking-widest uppercase">
          {label}
        </label>
        <output htmlFor={id} className="tabular-nums text-sm font-medium">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
    </div>
  );
}
