import {
  type Campaign,
  type Cents,
  type Creator,
  type Platform,
  type Rate,
  audienceFor,
  cents,
  rate,
  weightedEngagementRate,
} from '@/domain';

/**
 * roiEngine — projeção de alcance, impressões e retorno de uma campanha.
 *
 * Nota metodológica: isto é uma PROJEÇÃO com premissas explícitas, não uma medição.
 * Todas as constantes abaixo são premissas nomeadas e versionadas de propósito —
 * um número mágico solto no meio de uma fórmula é impossível de auditar depois.
 */

export const ENGINE_VERSION = '1.0.0' as const;

/**
 * Multiplicador de frequência: quantas impressões cada pessoa alcançada gera.
 * Stories reaparecem para o mesmo público mais vezes que um post de feed.
 */
const FREQUENCY_BY_FORMAT: Readonly<Record<string, number>> = {
  reel: 1.35,
  story: 1.8,
  feed: 1.15,
  short: 1.4,
  video: 1.2,
};

/** Decaimento de alcance a cada entrega adicional na mesma campanha (fadiga de audiência). */
const DELIVERABLE_DECAY = 0.88;

/** Fração da audiência efetivamente alcançada quando não há dado real de alcance. */
const FALLBACK_REACH_RATIO: Readonly<Record<Platform, number>> = {
  instagram: 0.28,
  tiktok: 0.42,
  youtube: 0.22,
};

/** Taxa de conversão de engajamento em ação de valor (clique, cupom, compra). */
const DEFAULT_CONVERSION_RATE = 0.021;

export interface RoiAssumptions {
  /** Valor médio de uma conversão, em centavos. */
  readonly avgOrderValueCents: Cents;
  /** Margem de contribuição sobre a receita (0–1). ROI sobre receita bruta mente. */
  readonly contributionMargin: Rate;
  /** Sobrescreve a taxa de conversão padrão quando a marca tem dado histórico. */
  readonly conversionRate?: Rate;
}

export interface ReachProjection {
  readonly reach: number;
  readonly impressions: number;
  readonly engagements: number;
  readonly cpmCents: Cents;
  readonly costPerEngagementCents: Cents;
}

export interface RoiProjection extends ReachProjection {
  readonly investmentCents: Cents;
  readonly conversions: number;
  readonly grossRevenueCents: Cents;
  readonly contributionCents: Cents;
  readonly netReturnCents: Cents;
  /** ROI como múltiplo: 0.5 = +50%. Negativo = prejuízo. */
  readonly roi: number;
  /** ROAS = receita bruta ÷ investimento. Métrica de mídia, complementar ao ROI. */
  readonly roas: number;
  readonly engineVersion: string;
}

const safeDiv = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : numerator / denominator;

/**
 * Alcance efetivo de uma entrega, com decaimento por repetição.
 *
 * Soma geométrica: entrega 1 alcança R, entrega 2 alcança R × 0.88, e assim por diante.
 * Sem o decaimento, 10 entregas pareceriam alcançar 10× o público — o que é falso,
 * porque em boa parte é a mesma audiência sendo impactada de novo.
 */
export const projectReach = (
  creator: Creator,
  platform: Platform,
  deliverableCount: number,
): number => {
  if (deliverableCount <= 0) return 0;

  const audience = audienceFor(creator, platform);
  if (!audience) return 0;

  const baseReach =
    audience.avgReach > 0
      ? audience.avgReach
      : Math.round(audience.followers * FALLBACK_REACH_RATIO[platform]);

  let total = 0;
  let current = baseReach;
  for (let i = 0; i < deliverableCount; i += 1) {
    total += current;
    current *= DELIVERABLE_DECAY;
  }
  return Math.round(total);
};

export const projectImpressions = (reach: number, format: string): number => {
  const frequency = FREQUENCY_BY_FORMAT[format] ?? 1.2;
  return Math.round(reach * frequency);
};

export interface ReachInput {
  readonly creator: Creator;
  readonly campaign: Campaign;
  readonly investmentCents: Cents;
}

export const computeReach = ({
  creator,
  campaign,
  investmentCents,
}: ReachInput): ReachProjection => {
  const { platforms, formats, deliverableCount } = campaign.brief;

  const reach = platforms.reduce(
    (sum, platform) => sum + projectReach(creator, platform, deliverableCount),
    0,
  );

  const primaryFormat = formats[0] ?? 'feed';
  const impressions = projectImpressions(reach, primaryFormat);
  const engagements = Math.round(reach * weightedEngagementRate(creator));

  const cpmCents = cents(Math.round(safeDiv(investmentCents, impressions) * 1000));
  const costPerEngagementCents = cents(
    Math.round(safeDiv(investmentCents, engagements)),
  );

  return { reach, impressions, engagements, cpmCents, costPerEngagementCents };
};

/**
 * ROI = (contribuição − investimento) ÷ investimento
 *
 * Usamos contribuição (receita × margem), não receita bruta. Uma campanha que gera
 * R$ 100k de receita com 12% de margem devolve R$ 12k — declarar "ROI de 10x" sobre
 * a receita bruta é o erro mais comum em relatório de influência.
 */
export const computeRoi = (
  input: ReachInput,
  assumptions: RoiAssumptions,
): RoiProjection => {
  const reachProjection = computeReach(input);
  const { investmentCents } = input;

  const conversionRate = assumptions.conversionRate ?? rate(DEFAULT_CONVERSION_RATE);
  const conversions = Math.round(reachProjection.engagements * conversionRate);

  const grossRevenueCents = cents(conversions * assumptions.avgOrderValueCents);
  const contributionCents = cents(
    Math.round(grossRevenueCents * assumptions.contributionMargin),
  );
  const netReturnCents = cents(contributionCents - investmentCents);

  return {
    ...reachProjection,
    investmentCents,
    conversions,
    grossRevenueCents,
    contributionCents,
    netReturnCents,
    roi: safeDiv(netReturnCents, investmentCents),
    roas: safeDiv(grossRevenueCents, investmentCents),
    engineVersion: ENGINE_VERSION,
  };
};

/** Investimento que zera o resultado — abaixo disso a campanha dá lucro. */
export const breakEvenInvestment = (
  input: ReachInput,
  assumptions: RoiAssumptions,
): Cents => computeRoi(input, assumptions).contributionCents;
