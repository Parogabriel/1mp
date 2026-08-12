import {
  type CreatorId,
  type Cents,
  type Platform,
  type Rate,
  rate,
} from '../value-objects';

/** Faixas de audiência. O tier muda o preço de mercado e o poder de negociação. */
export const CREATOR_TIERS = ['nano', 'micro', 'mid', 'macro', 'mega'] as const;
export type CreatorTier = (typeof CREATOR_TIERS)[number];

export interface AudienceProfile {
  readonly platform: Platform;
  readonly handle: string;
  readonly followers: number;
  /** Engajamento médio observado, normalizado 0–1. */
  readonly engagementRate: Rate;
  /** Alcance médio por post nos últimos 30 dias. Nunca estimar se o dado real existe. */
  readonly avgReach: number;
}

/** Praça do criador. Marca filtra por região porque frete e evento presencial dependem disso. */
export interface CreatorLocation {
  readonly city: string;
  /** Sigla da UF, sempre 2 letras maiúsculas. */
  readonly uf: string;
}

export interface Creator {
  readonly id: CreatorId;
  readonly displayName: string;
  readonly niches: readonly string[];
  readonly audiences: readonly AudienceProfile[];
  /** Valor base por post. Negociação parte daqui, não do "quanto a marca quer pagar". */
  readonly baseRateCents: Cents;
  readonly completedCampaigns: number;
  readonly joinedAt: Date;
  readonly location: CreatorLocation;
  /** Identidade e posse das contas conferidas. Promessa contratual, não enfeite. */
  readonly verified: boolean;
  /** `null` enquanto o criador não subiu foto; a UI cai no monograma. */
  readonly avatarUrl: string | null;
}

const TIER_THRESHOLDS: ReadonlyArray<readonly [CreatorTier, number]> = [
  ['mega', 1_000_000],
  ['macro', 500_000],
  ['mid', 100_000],
  ['micro', 10_000],
  ['nano', 0],
];

export const totalFollowers = (creator: Creator): number =>
  creator.audiences.reduce((sum, a) => sum + a.followers, 0);

export const tierOf = (creator: Creator): CreatorTier => {
  const total = totalFollowers(creator);
  // Sempre há match (o array cobre de 0 ao infinito); o fallback existe para
  // não precisar de `!` sobre o `undefined` que `find` carrega no tipo.
  return TIER_THRESHOLDS.find(([, floor]) => total >= floor)?.[0] ?? 'nano';
};

/**
 * Ponderado por seguidores, não média simples: um perfil de 5k com 12% de
 * engajamento não compensa um de 800k com 1,2%.
 */
export const weightedEngagementRate = (creator: Creator): Rate => {
  const total = totalFollowers(creator);
  if (total === 0) return rate(0);

  const weighted = creator.audiences.reduce(
    (sum, a) => sum + a.engagementRate * a.followers,
    0,
  );
  return rate(weighted / total);
};

export const audienceFor = (
  creator: Creator,
  platform: Platform,
): AudienceProfile | undefined => creator.audiences.find((a) => a.platform === platform);
