'use client';

import { useId, useMemo, useState } from 'react';
import { cents, formatBRL, fromBRL, fromPercent, type Brand } from '@/domain';
import { computeRoi } from '@/infrastructure/roiEngine';
import { selectCampaignsByBrand, useWorkspaceStore } from '@/application/stores/useWorkspaceStore';

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
    }),
    { investmentCents: 0, contributionCents: 0, reach: 0 },
  );
  const totalRoi =
    totals.investmentCents === 0
      ? 0
      : (totals.contributionCents - totals.investmentCents) / totals.investmentCents;

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

      <dl
        className="grid grid-cols-3 gap-4 border-(length:--border-width) border-line bg-surface-raised p-4"
        style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard-sm)' }}
      >
        <Metric label="Alcance total" value={compact.format(totals.reach)} />
        <Metric label="Investido" value={formatBRL(cents(totals.investmentCents))} />
        <Metric
          label="ROI do portfólio"
          value={`${totalRoi >= 0 ? '+' : ''}${(totalRoi * 100).toFixed(0)}%`}
          tone={totalRoi >= 0 ? 'var(--accent)' : 'var(--signal)'}
        />
      </dl>

      <ul className="space-y-2">
        {rows.map(({ campaign, creator, projection }) => (
          <li
            key={campaign.id}
            className="flex items-center justify-between gap-4 border-(length:--border-width) border-line bg-surface-raised px-4 py-3"
            style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard-sm)' }}
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{campaign.title}</p>
              <p className="text-[11px] text-ink-muted">
                {creator.displayName} · alcance projetado {compact.format(projection.reach)}
              </p>
            </div>
            <span
              className="shrink-0 font-mono text-sm font-bold"
              style={{ color: projection.roi >= 0 ? 'var(--accent)' : 'var(--signal)' }}
            >
              {projection.roi >= 0 ? '+' : ''}
              {(projection.roi * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone?: string;
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd className="font-mono text-lg font-bold" style={tone ? { color: tone } : undefined}>
        {value}
      </dd>
    </div>
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
        <output htmlFor={id} className="font-mono text-sm font-bold">
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
