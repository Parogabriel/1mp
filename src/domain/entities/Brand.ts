import type { BrandId, Cents, CreatorId } from '../value-objects';

export const BRAND_SEGMENTS = [
  'beauty',
  'fashion',
  'food',
  'fitness',
  'tech',
  'finance',
  'gaming',
  'travel',
] as const;
export type BrandSegment = (typeof BRAND_SEGMENTS)[number];

export interface Brand {
  readonly id: BrandId;
  readonly legalName: string;
  readonly tradeName: string;
  readonly segment: BrandSegment;
  /** Orçamento total aprovado no período. Teto duro — campanha nenhuma passa disso. */
  readonly budgetCents: Cents;
  /** Já comprometido em campanhas ativas. */
  readonly committedCents: Cents;
  readonly favoriteCreatorIds: readonly CreatorId[];
  readonly createdAt: Date;
}

export const availableBudget = (brand: Brand): Cents =>
  Math.max(0, brand.budgetCents - brand.committedCents) as Cents;

export const canAfford = (brand: Brand, amount: Cents): boolean =>
  availableBudget(brand) >= amount;

export const isFavorite = (brand: Brand, creatorId: CreatorId): boolean =>
  brand.favoriteCreatorIds.includes(creatorId);

/** Retorna nova Brand — entidades são imutáveis; mutação vive na store, não aqui. */
export const withFavorite = (brand: Brand, creatorId: CreatorId): Brand =>
  isFavorite(brand, creatorId)
    ? brand
    : { ...brand, favoriteCreatorIds: [...brand.favoriteCreatorIds, creatorId] };

export const withoutFavorite = (brand: Brand, creatorId: CreatorId): Brand => ({
  ...brand,
  favoriteCreatorIds: brand.favoriteCreatorIds.filter((id) => id !== creatorId),
});
