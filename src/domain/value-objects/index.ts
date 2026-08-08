/**
 * Value Objects — tipos primitivos do domínio.
 *
 * Regra desta camada: ZERO dependência externa. Sem React, sem Zustand, sem Next.
 * Se um arquivo em /domain precisar importar algo de fora, a modelagem está errada.
 */

/** Branded types: impedem trocar um CreatorId por um BrandId sem o compilador reclamar. */
declare const brand: unique symbol;
type Brand<T, TBrand> = T & { readonly [brand]: TBrand };

export type CreatorId = Brand<string, 'CreatorId'>;
export type BrandId = Brand<string, 'BrandId'>;
export type CampaignId = Brand<string, 'CampaignId'>;
export type ScheduledPostId = Brand<string, 'ScheduledPostId'>;

export const asCreatorId = (v: string): CreatorId => v as CreatorId;
export const asBrandId = (v: string): BrandId => v as BrandId;
export const asCampaignId = (v: string): CampaignId => v as CampaignId;
export const asScheduledPostId = (v: string): ScheduledPostId => v as ScheduledPostId;

/**
 * Dinheiro em centavos, sempre inteiro.
 * Float para dinheiro é bug garantido: 0.1 + 0.2 !== 0.3 em IEEE 754.
 */
export type Cents = Brand<number, 'Cents'>;

export const cents = (value: number): Cents => {
  if (!Number.isInteger(value)) {
    throw new RangeError(`Cents precisa ser inteiro, recebeu ${value}`);
  }
  return value as Cents;
};

export const fromBRL = (reais: number): Cents => cents(Math.round(reais * 100));
export const toBRL = (v: Cents): number => v / 100;

export const formatBRL = (v: Cents): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(toBRL(v));

/** Percentual normalizado 0–1 (0.045 = 4,5%). Nunca guardar "4.5" e dividir depois. */
export type Rate = Brand<number, 'Rate'>;

export const rate = (value: number): Rate => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`Rate precisa estar entre 0 e 1, recebeu ${value}`);
  }
  return value as Rate;
};

export const fromPercent = (percent: number): Rate => rate(percent / 100);
export const toPercent = (r: Rate): number => r * 100;

export const PLATFORMS = ['instagram', 'tiktok', 'youtube'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const POST_FORMATS = ['reel', 'story', 'feed', 'short', 'video'] as const;
export type PostFormat = (typeof POST_FORMATS)[number];

/** Qual formato é válido em qual plataforma — regra de negócio, não de UI. */
export const FORMATS_BY_PLATFORM: Readonly<Record<Platform, readonly PostFormat[]>> = {
  instagram: ['reel', 'story', 'feed'],
  tiktok: ['video'],
  youtube: ['short', 'video'],
};

export const isFormatAllowed = (platform: Platform, format: PostFormat): boolean =>
  FORMATS_BY_PLATFORM[platform].includes(format);
