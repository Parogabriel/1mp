'use client';

import { useId, useMemo, useState, useRef } from 'react';
import {
  asBrandId,
  asCampaignId,
  asCreatorId,
  cents,
  formatBRL,
  fromBRL,
  fromPercent,
  type Campaign,
  type Creator,
} from '@/domain';
import { computeRoi } from '@/infrastructure/roiEngine';
import { useGodModeStore } from '@/application/stores/useGodModeStore';
import { useGsapValueChange } from '@/presentation/hooks/useGsapValueChange';
import {
  DEMO_ASSUMPTIONS,
  DEMO_AVG_ORDER_VALUE_BRL,
  DEMO_CONTRIBUTION_MARGIN_PERCENT,
} from './demoAssumptions';

/** Criador sintético: a calculadora projeta a partir dos inputs, não de um perfil real. */
const buildCreator = (followers: number, engagementPercent: number): Creator => ({
  id: asCreatorId('calc-preview'),
  displayName: 'Projeção',
  niches: [],
  audiences: [
    {
      platform: 'instagram',
      handle: '@projecao',
      followers,
      engagementRate: fromPercent(engagementPercent),
      avgReach: 0, // 0 força o engine a usar o ratio de fallback da plataforma
    },
  ],
  baseRateCents: cents(0),
  completedCampaigns: 0,
  joinedAt: new Date(0),
  // Campos de vitrine: irrelevantes para o cálculo, presentes só para satisfazer o tipo.
  location: { city: '', uf: '' },
  verified: false,
  avatarUrl: null,
});

const buildCampaign = (deliverables: number): Campaign => ({
  id: asCampaignId('calc-preview'),
  brandId: asBrandId('calc-preview'),
  creatorId: null,
  title: 'Projeção',
  brief: {
    objective: '',
    keyMessage: '',
    platforms: ['instagram'],
    formats: ['reel'],
    deliverableCount: deliverables,
    mustMention: [],
    mustAvoid: [],
  },
  status: 'draft',
  offerCents: cents(0),
  startsAt: new Date(0),
  endsAt: new Date(0),
  createdAt: new Date(0),
  // Campanha sintética da calculadora: nunca transitou de estado.
  history: [],
});

interface SliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly format: (v: number) => string;
  readonly onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, format, onChange }: SliderProps) {
  const id = useId();
  const outputRef = useRef<HTMLOutputElement>(null);

  useGsapValueChange(outputRef, value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-bold tracking-widest uppercase">
          {label}
        </label>
        <output ref={outputRef} htmlFor={id} className="tabular-nums text-sm font-medium">
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

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

interface RoiCalculatorProps {
  /**
   * Dentro de uma `ProductFrame` a moldura já é da janela: a calculadora larga a
   * borda, a sombra e o título visível para não desenhar um card dentro do card.
   * O título continua no DOM como texto de leitor de tela — é o alvo do
   * `aria-labelledby`, e sem ele a seção ficaria anônima.
   */
  readonly embedded?: boolean;
}

export function RoiCalculator({ embedded = false }: RoiCalculatorProps = {}) {
  const enabled = useGodModeStore((s) => s.flags.roiCalculator);

  /*
   * O estado inicial abria em ROI de −41%.
   *
   * Os quatro valores tinham sido escolhidos sem conferir o que o motor devolvia
   * para eles, e a calculadora virou a peça central da home — abrir a
   * demonstração no prejuízo diz o contrário do que a página argumenta. Estes
   * descrevem um perfil médio plausível e caem na faixa positiva; a região
   * negativa continua a dois arrastes de distância, que é o ponto de ter
   * controles em vez de um número impresso.
   */
  const [followers, setFollowers] = useState(180_000);
  const [engagement, setEngagement] = useState(5);
  const [deliverables, setDeliverables] = useState(3);
  const [investment, setInvestment] = useState(6_000);

  const projection = useMemo(
    () =>
      computeRoi(
        {
          creator: buildCreator(followers, engagement),
          campaign: buildCampaign(deliverables),
          investmentCents: fromBRL(investment),
        },
        DEMO_ASSUMPTIONS,
      ),
    [followers, engagement, deliverables, investment],
  );

  const roiRef = useRef<HTMLElement>(null);
  const roiPercent = (projection.roi * 100).toFixed(0);

  useGsapValueChange(roiRef, roiPercent);

  if (!enabled) return null;

  const positive = projection.roi >= 0;

  return (
    <section
      aria-labelledby="roi-heading"
      className={
        embedded
          ? ''
          : 'rounded-card border-(length:--border-width) border-line bg-surface-raised p-6 shadow-lift'
      }
    >
      <h2
        id="roi-heading"
        className={embedded ? 'sr-only' : 'text-lg font-bold tracking-tight'}
      >
        Projete o retorno antes de fechar
      </h2>
      {!embedded && (
        <p className="mt-1 text-sm text-ink-muted">
          Ajuste os números da campanha e veja o resultado projetado.
        </p>
      )}

      <div className={`grid gap-6 md:grid-cols-2 ${embedded ? '' : 'mt-6'}`}>
        <div className="space-y-5">
          <Slider
            label="Seguidores"
            value={followers}
            min={1_000}
            max={2_000_000}
            step={1_000}
            format={compact.format}
            onChange={setFollowers}
          />
          <Slider
            label="Engajamento"
            value={engagement}
            min={0.5}
            max={15}
            step={0.1}
            format={(v) => `${v.toFixed(1)}%`}
            onChange={setEngagement}
          />
          <Slider
            label="Entregas"
            value={deliverables}
            min={1}
            max={12}
            step={1}
            format={(v) => String(v)}
            onChange={setDeliverables}
          />
          <Slider
            label="Investimento"
            value={investment}
            min={500}
            max={150_000}
            step={500}
            format={(v) => formatBRL(fromBRL(v))}
            onChange={setInvestment}
          />
        </div>

        <dl className="space-y-3 self-start">
          <Metric label="Alcance" value={compact.format(projection.reach)} />
          <Metric label="Impressões" value={compact.format(projection.impressions)} />
          <Metric label="Engajamentos" value={compact.format(projection.engagements)} />
          <Metric label="CPM" value={formatBRL(projection.cpmCents)} />
          <Metric label="Conversões" value={compact.format(projection.conversions)} />

          <div
            className="mt-4 border-t-(length:--border-width) border-line pt-4"
            style={{ color: positive ? 'var(--accent)' : 'var(--signal)' }}
          >
            <dt className="text-xs font-bold tracking-widest uppercase">ROI projetado</dt>
            <dd ref={roiRef} className="tabular-nums text-4xl font-light">
              {positive ? '+' : ''}
              {roiPercent}%
            </dd>
            <dd className="mt-1 text-xs text-ink-muted">
              Retorno líquido de {formatBRL(projection.netReturnCents)} sobre margem de{' '}
            {DEMO_CONTRIBUTION_MARGIN_PERCENT}%
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Projeção baseada em premissas do motor v{projection.engineVersion}: ticket médio de{' '}
        {formatBRL(fromBRL(DEMO_AVG_ORDER_VALUE_BRL))}, margem de contribuição de{' '}
        {DEMO_CONTRIBUTION_MARGIN_PERCENT}% e conversão de 2,1% sobre engajamento. Resultados
        reais variam por segmento e criativo.
      </p>
    </section>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  const valueRef = useRef<HTMLElement>(null);

  useGsapValueChange(valueRef, value);

  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd ref={valueRef} className="tabular-nums text-sm font-medium">
        {value}
      </dd>
    </div>
  );
}
