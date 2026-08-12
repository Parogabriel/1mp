import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  asBrandId,
  asCampaignId,
  asCreatorId,
  asScheduledPostId,
  cents,
  formatBRL,
  fromBRL,
  fromPercent,
  kanbanColumnOf,
  transitionTo,
  withFavorite,
  withoutFavorite,
  InvalidTransitionError,
  type Brand,
  type BrandId,
  type BrandSegment,
  type Campaign,
  type CampaignBrief,
  type CampaignId,
  type CampaignStatus,
  type Cents,
  type Creator,
  type CreatorId,
  type KanbanColumn,
  type Platform,
  type PostFormat,
  type ScheduledPost,
  type ScheduledPostId,
} from '@/domain';
import { useGodModeStore } from './useGodModeStore';

export type MoveCampaignResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string };

/** Só o que a marca pode editar. `committedCents` fica de fora: é derivado das campanhas. */
export interface BrandPatch {
  readonly tradeName?: string;
  readonly legalName?: string;
  readonly segment?: BrandSegment;
  readonly budgetCents?: Cents;
}

export type UpdateBrandResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string };

export interface CreateCampaignInput {
  readonly brandId: BrandId;
  readonly creatorId: CreatorId | null;
  readonly title: string;
  readonly brief: CampaignBrief;
  readonly offerCents: Cents;
  readonly startsAt: Date;
  readonly endsAt: Date;
}

export interface CreateScheduledPostInput {
  readonly campaignId: CampaignId;
  readonly creatorId: CreatorId;
  readonly platform: Platform;
  readonly format: PostFormat;
  readonly caption: string;
  readonly hashtags: readonly string[];
  readonly scheduledFor: Date;
}

export type ScheduledPostPatch = Partial<
  Pick<ScheduledPost, 'platform' | 'format' | 'caption' | 'hashtags' | 'scheduledFor' | 'status'>
>;

interface WorkspaceState {
  readonly creators: Readonly<Record<CreatorId, Creator>>;
  readonly brands: Readonly<Record<BrandId, Brand>>;
  readonly campaigns: Readonly<Record<CampaignId, Campaign>>;
  readonly scheduledPosts: Readonly<Record<ScheduledPostId, ScheduledPost>>;
  readonly seededAt: Date | null;

  readonly moveCampaign: (id: CampaignId, to: CampaignStatus) => MoveCampaignResult;
  readonly createCampaign: (input: CreateCampaignInput) => Campaign;

  readonly createScheduledPost: (input: CreateScheduledPostInput) => ScheduledPost;
  readonly updateScheduledPost: (id: ScheduledPostId, patch: ScheduledPostPatch) => void;
  readonly removeScheduledPost: (id: ScheduledPostId) => void;

  readonly updateBrand: (id: BrandId, patch: BrandPatch) => UpdateBrandResult;

  readonly favoriteCreator: (brandId: BrandId, creatorId: CreatorId) => void;
  readonly unfavoriteCreator: (brandId: BrandId, creatorId: CreatorId) => void;

  readonly seed: () => void;
  readonly reset: () => void;
}

const EMPTY_STATE = {
  creators: {} as Readonly<Record<CreatorId, Creator>>,
  brands: {} as Readonly<Record<BrandId, Brand>>,
  campaigns: {} as Readonly<Record<CampaignId, Campaign>>,
  scheduledPosts: {} as Readonly<Record<ScheduledPostId, ScheduledPost>>,
  seededAt: null as Date | null,
};

/**
 * Revive as datas ao reidratar do localStorage.
 *
 * O parse devolve string onde o tipo promete `Date`, e aí `transitionTo`,
 * `validatePost` e `Intl.format` quebram depois de um reload, longe daqui.
 *
 * Tudo abaixo precisa estar declarado ANTES de `create(persist(...))`: o `merge`
 * roda síncrono durante a criação da store, então um `const` posterior estaria
 * na temporal dead zone — e o zustand engole esse erro em silêncio, deixando a
 * store voltar vazia sem nada no console.
 */
type PersistedWorkspace = Pick<
  WorkspaceState,
  'creators' | 'brands' | 'campaigns' | 'scheduledPosts' | 'seededAt'
>;

const asDate = (value: unknown): Date => new Date(value as string);
const asDateOrNull = (value: unknown): Date | null =>
  typeof value === 'string' ? new Date(value) : null;

const mapValues = <T, R>(record: Readonly<Record<string, T>>, fn: (value: T) => R): Record<string, R> => {
  const result: Record<string, R> = {};
  for (const [key, value] of Object.entries(record)) result[key] = fn(value);
  return result;
};

/** Perfil de vitrine dos criadores do seed. A migração de estado antigo também lê daqui. */
const SEED_CREATOR_PROFILES: Readonly<
  Record<string, Pick<Creator, 'location' | 'verified' | 'avatarUrl'>>
> = {
  'creator-lais': {
    location: { city: 'São Paulo', uf: 'SP' },
    verified: true,
    avatarUrl: null,
  },
  'creator-pedro': {
    location: { city: 'Florianópolis', uf: 'SC' },
    verified: true,
    avatarUrl: null,
  },
  'creator-bruna': {
    location: { city: 'Belo Horizonte', uf: 'MG' },
    verified: false,
    avatarUrl: null,
  },
};

const FALLBACK_PROFILE: Pick<Creator, 'location' | 'verified' | 'avatarUrl'> = {
  location: { city: 'Brasil', uf: '' },
  verified: false,
  avatarUrl: null,
};

/**
 * Migra criadores salvos antes de `location`/`verified`/`avatarUrl` existirem —
 * sem o fallback a UI lê `location.city` de `undefined` e a tela quebra.
 */
function reviveCreator(c: Creator): Creator {
  const profile = SEED_CREATOR_PROFILES[c.id] ?? FALLBACK_PROFILE;
  return {
    ...c,
    joinedAt: asDate(c.joinedAt),
    location: c.location ?? profile.location,
    verified: c.verified ?? profile.verified,
    avatarUrl: c.avatarUrl ?? profile.avatarUrl,
  };
}

/**
 * Revive datas e migra campanha salva antes de `history` existir. O registro
 * sintético usa `createdAt` e o status atual — é o mínimo verdadeiro que dá
 * para afirmar sobre uma campanha cujo passado não foi gravado.
 */
function reviveCampaign(c: Campaign): Campaign {
  const createdAt = asDate(c.createdAt);

  return {
    ...c,
    startsAt: asDate(c.startsAt),
    endsAt: asDate(c.endsAt),
    createdAt,
    history: Array.isArray(c.history)
      ? c.history.map((e) => ({ ...e, at: asDate(e.at) }))
      : [{ from: null, to: c.status, at: createdAt }],
  };
}

function revivePersisted(persisted: unknown): Partial<PersistedWorkspace> {
  if (typeof persisted !== 'object' || persisted === null) return {};
  const raw = persisted as Record<keyof PersistedWorkspace, unknown>;

  const creators = (raw.creators ?? {}) as Record<string, Creator>;
  const brands = (raw.brands ?? {}) as Record<string, Brand>;
  const campaigns = (raw.campaigns ?? {}) as Record<string, Campaign>;
  const scheduledPosts = (raw.scheduledPosts ?? {}) as Record<string, ScheduledPost>;

  return {
    creators: mapValues(creators, reviveCreator) as Readonly<Record<CreatorId, Creator>>,
    brands: mapValues(brands, (b) => ({ ...b, createdAt: asDate(b.createdAt) })) as Readonly<
      Record<BrandId, Brand>
    >,
    campaigns: mapValues(campaigns, reviveCampaign) as Readonly<
      Record<CampaignId, Campaign>
    >,
    scheduledPosts: mapValues(scheduledPosts, (p) => ({
      ...p,
      scheduledFor: asDate(p.scheduledFor),
      publishedAt: asDateOrNull(p.publishedAt),
    })) as Readonly<Record<ScheduledPostId, ScheduledPost>>,
    seededAt: asDateOrNull(raw.seededAt),
  };
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Nasce semeada: sem isso, quem chega com localStorage limpo vê a home e o
      // CRM vazios, e só o One-Click Seed — atrás de passcode — os preenchia.
      // Estado persistido, quando existe, sobrescreve isto no `merge`.
      ...buildSeedData(),
      seededAt: null as Date | null,

      moveCampaign: (id, to) => {
        const campaign = get().campaigns[id];
        if (!campaign) return { ok: false, message: 'Campanha não encontrada.' };

        try {
          const next = transitionTo(campaign, to);
          set({ campaigns: { ...get().campaigns, [id]: next } });
          return { ok: true };
        } catch (err) {
          if (err instanceof InvalidTransitionError) {
            return { ok: false, message: err.message };
          }
          throw err;
        }
      },

      createCampaign: (input) => {
        const now = new Date();
        const campaign: Campaign = {
          id: asCampaignId(crypto.randomUUID()),
          brandId: input.brandId,
          creatorId: input.creatorId,
          title: input.title,
          brief: input.brief,
          status: 'draft',
          offerCents: input.offerCents,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          createdAt: now,
          // O nascimento em `draft` também é um evento: sem ele a linha do
          // tempo começaria no ar, sem ponto de partida.
          history: [{ from: null, to: 'draft', at: now }],
        };
        // Sem comprometer o valor, `availableBudget` nunca diminui: dava para
        // criar cem campanhas sem a barra se mover, e o `canAfford` que trava o
        // wizard ficava decorativo.
        const brand = get().brands[input.brandId];
        const brands = brand
          ? {
              ...get().brands,
              [brand.id]: {
                ...brand,
                committedCents: cents(brand.committedCents + campaign.offerCents),
              },
            }
          : get().brands;

        set({ campaigns: { ...get().campaigns, [campaign.id]: campaign }, brands });
        return campaign;
      },

      createScheduledPost: (input) => {
        const post: ScheduledPost = {
          id: asScheduledPostId(crypto.randomUUID()),
          campaignId: input.campaignId,
          creatorId: input.creatorId,
          platform: input.platform,
          format: input.format,
          caption: input.caption,
          hashtags: input.hashtags,
          scheduledFor: input.scheduledFor,
          status: 'idea',
          publishedAt: null,
        };
        set({ scheduledPosts: { ...get().scheduledPosts, [post.id]: post } });
        return post;
      },

      updateScheduledPost: (id, patch) => {
        const current = get().scheduledPosts[id];
        if (!current) return;
        set({
          scheduledPosts: { ...get().scheduledPosts, [id]: { ...current, ...patch } },
        });
      },

      removeScheduledPost: (id) => {
        const rest = { ...get().scheduledPosts };
        delete rest[id];
        set({ scheduledPosts: rest });
      },

      updateBrand: (id, patch) => {
        const brand = get().brands[id];
        if (!brand) return { ok: false, message: 'Marca não encontrada.' };

        const tradeName = patch.tradeName ?? brand.tradeName;
        if (tradeName.trim().length === 0) {
          return { ok: false, message: 'O nome fantasia não pode ficar vazio.' };
        }

        // Orçamento abaixo do já comprometido deixaria `availableBudget`
        // negativo e o `canAfford` do wizard sem sentido. A store recusa em vez
        // de aceitar um estado que o domínio não sabe representar.
        const budgetCents = patch.budgetCents ?? brand.budgetCents;
        if (budgetCents < brand.committedCents) {
          return {
            ok: false,
            message: `O orçamento não pode ficar abaixo de ${formatBRL(brand.committedCents)}, que já está comprometido em campanhas.`,
          };
        }

        set({
          brands: {
            ...get().brands,
            [id]: { ...brand, ...patch, tradeName, budgetCents },
          },
        });
        return { ok: true };
      },

      favoriteCreator: (brandId, creatorId) => {
        const brand = get().brands[brandId];
        if (!brand) return;
        set({ brands: { ...get().brands, [brandId]: withFavorite(brand, creatorId) } });
      },

      unfavoriteCreator: (brandId, creatorId) => {
        const brand = get().brands[brandId];
        if (!brand) return;
        set({ brands: { ...get().brands, [brandId]: withoutFavorite(brand, creatorId) } });
      },

      seed: () => {
        const data = buildSeedData();
        set({ ...data, seededAt: new Date() });
        useGodModeStore.getState().markSeeded();
      },

      reset: () => set({ ...EMPTY_STATE }),
    }),
    {
      name: '1mp.workspace',
      partialize: ({ creators, brands, campaigns, scheduledPosts, seededAt }) => ({
        creators,
        brands,
        campaigns,
        scheduledPosts,
        seededAt,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...revivePersisted(persisted),
      }),
    },
  ),
);

/**
 * Derivações puras. Recebem o `Record` cru, não `WorkspaceState`: no Zustand v5 o
 * snapshot é comparado por identidade, então um selector que monta objeto novo a
 * cada chamada nunca estabiliza e derruba o componente em re-render infinito.
 * Quem consome assina a coleção e deriva dentro de `useMemo`.
 */

/** Agrupa campanhas nas 3 colunas do Kanban. O agrupamento vem do domínio. */
export const selectKanban = (
  campaigns: Readonly<Record<CampaignId, Campaign>>,
  creatorId: CreatorId | null,
): Readonly<Record<KanbanColumn, readonly Campaign[]>> => {
  const columns: Record<KanbanColumn, Campaign[]> = {
    proposals: [],
    in_progress: [],
    completed: [],
  };

  for (const campaign of Object.values(campaigns)) {
    // Sem criador logado (demo/guest), mostra o quadro inteiro em vez de vazio.
    if (creatorId !== null && campaign.creatorId !== creatorId) continue;
    columns[kanbanColumnOf(campaign)].push(campaign);
  }

  return columns;
};

export const selectPostsByCreator = (
  scheduledPosts: Readonly<Record<ScheduledPostId, ScheduledPost>>,
  creatorId: CreatorId | null,
): readonly ScheduledPost[] =>
  Object.values(scheduledPosts).filter(
    (post) => creatorId === null || post.creatorId === creatorId,
  );

export const selectCampaignsByCreator = (
  campaigns: Readonly<Record<CampaignId, Campaign>>,
  creatorId: CreatorId | null,
): readonly Campaign[] =>
  Object.values(campaigns).filter(
    (campaign) => creatorId === null || campaign.creatorId === creatorId,
  );

export const selectCampaignsByBrand = (
  campaigns: Readonly<Record<CampaignId, Campaign>>,
  brandId: BrandId | null,
): readonly Campaign[] =>
  Object.values(campaigns).filter(
    (campaign) => brandId === null || campaign.brandId === brandId,
  );

export const selectFavoriteCreators = (
  creators: Readonly<Record<CreatorId, Creator>>,
  brand: Brand,
): readonly Creator[] =>
  brand.favoriteCreatorIds
    .map((id) => creators[id])
    .filter((creator): creator is Creator => creator !== undefined);

// ── Seed ─────────────────────────────────────────────────────────────────────

/**
 * Declaração de função, não `const` de arrow — e o mesmo vale para `addDays` e
 * `buildSeedData` abaixo. A store nasce semeada, então `buildSeedData()` roda
 * durante `create()`; um `const` declarado depois ainda estaria na temporal dead
 * zone nesse instante. Já deu `Cannot access 'indexBy' before initialization`.
 */
function indexBy<K extends string, T>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Record<K, T> {
  const result = {} as Record<K, T>;
  for (const item of items) result[keyOf(item)] = item;
  return result;
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000);
}

function buildSeedData(): Pick<WorkspaceState, 'creators' | 'brands' | 'campaigns' | 'scheduledPosts'> {
  const lais: Creator = {
    id: asCreatorId('creator-lais'),
    displayName: 'Laís Mattos',
    niches: ['beleza', 'lifestyle'],
    audiences: [
      {
        platform: 'instagram',
        handle: '@laismattos',
        followers: 340_000,
        engagementRate: fromPercent(4.8),
        avgReach: 92_000,
      },
      {
        platform: 'tiktok',
        handle: '@laismattos',
        followers: 210_000,
        engagementRate: fromPercent(6.1),
        avgReach: 0,
      },
    ],
    baseRateCents: fromBRL(4_500),
    completedCampaigns: 12,
    joinedAt: new Date('2024-02-10'),
    ...(SEED_CREATOR_PROFILES['creator-lais'] ?? FALLBACK_PROFILE),
  };

  const pedro: Creator = {
    id: asCreatorId('creator-pedro'),
    displayName: 'Pedro Corrêa',
    niches: ['tech', 'games'],
    audiences: [
      {
        platform: 'youtube',
        handle: '@pedrocorrea',
        followers: 128_000,
        engagementRate: fromPercent(3.2),
        avgReach: 38_000,
      },
    ],
    baseRateCents: fromBRL(3_200),
    completedCampaigns: 7,
    joinedAt: new Date('2024-06-01'),
    ...(SEED_CREATOR_PROFILES['creator-pedro'] ?? FALLBACK_PROFILE),
  };

  const bruna: Creator = {
    id: asCreatorId('creator-bruna'),
    displayName: 'Bruna Nutri',
    niches: ['fitness', 'alimentação'],
    audiences: [
      {
        platform: 'instagram',
        handle: '@nutri.bru',
        followers: 58_000,
        engagementRate: fromPercent(7.4),
        avgReach: 0,
      },
    ],
    baseRateCents: fromBRL(1_800),
    completedCampaigns: 21,
    joinedAt: new Date('2023-09-22'),
    ...(SEED_CREATOR_PROFILES['creator-bruna'] ?? FALLBACK_PROFILE),
  };

  const vervo: Brand = {
    id: asBrandId('brand-vervo'),
    legalName: 'Vervo Cosméticos LTDA',
    tradeName: 'Vervo',
    segment: 'beauty',
    budgetCents: fromBRL(120_000),
    committedCents: fromBRL(38_000),
    favoriteCreatorIds: [lais.id],
    createdAt: new Date('2024-01-15'),
  };

  const kaza: Brand = {
    id: asBrandId('brand-kaza'),
    legalName: 'Kaza Casa & Decoração LTDA',
    tradeName: 'Kaza',
    segment: 'tech',
    budgetCents: fromBRL(80_000),
    committedCents: fromBRL(12_000),
    favoriteCreatorIds: [],
    createdAt: new Date('2024-03-08'),
  };

  const briefBase: CampaignBrief = {
    objective: 'Gerar consideração de marca para o lançamento da linha.',
    keyMessage: 'A fórmula que acompanha sua rotina, não o contrário.',
    platforms: ['instagram'],
    formats: ['reel', 'story'],
    deliverableCount: 3,
    mustMention: ['#parceria'],
    mustAvoid: ['comparação direta com concorrentes'],
  };

  const proposta: Campaign = {
    id: asCampaignId('campaign-proposta'),
    brandId: kaza.id,
    creatorId: lais.id,
    title: 'Lançamento linha inverno',
    brief: briefBase,
    status: 'proposed',
    offerCents: fromBRL(5_500),
    startsAt: new Date('2026-08-20'),
    endsAt: new Date('2026-09-05'),
    createdAt: new Date('2026-08-01'),
    history: [
      { from: null, to: 'draft', at: addDays(new Date('2026-08-01'), 0) },
      { from: 'draft', to: 'proposed', at: addDays(new Date('2026-08-01'), 3) },
    ],
  };

  const negociando: Campaign = {
    id: asCampaignId('campaign-negociando'),
    brandId: vervo.id,
    creatorId: lais.id,
    title: 'Skincare rotina noturna',
    brief: { ...briefBase, formats: ['reel'] },
    status: 'negotiating',
    offerCents: fromBRL(7_200),
    startsAt: new Date('2026-08-25'),
    endsAt: new Date('2026-09-10'),
    createdAt: new Date('2026-08-03'),
    history: [
      { from: null, to: 'draft', at: addDays(new Date('2026-08-03'), 0) },
      { from: 'draft', to: 'proposed', at: addDays(new Date('2026-08-03'), 3) },
      { from: 'proposed', to: 'negotiating', at: addDays(new Date('2026-08-03'), 6) },
    ],
  };

  const producao: Campaign = {
    id: asCampaignId('campaign-producao'),
    brandId: vervo.id,
    creatorId: bruna.id,
    title: 'Vitamina D em foco',
    brief: { ...briefBase, platforms: ['instagram'], formats: ['feed', 'story'] },
    status: 'in_production',
    offerCents: fromBRL(2_400),
    startsAt: new Date('2026-07-28'),
    endsAt: new Date('2026-08-12'),
    createdAt: new Date('2026-07-20'),
    history: [
      { from: null, to: 'draft', at: addDays(new Date('2026-07-20'), 0) },
      { from: 'draft', to: 'proposed', at: addDays(new Date('2026-07-20'), 3) },
      { from: 'proposed', to: 'accepted', at: addDays(new Date('2026-07-20'), 6) },
      { from: 'accepted', to: 'in_production', at: addDays(new Date('2026-07-20'), 9) },
    ],
  };

  const entregue: Campaign = {
    id: asCampaignId('campaign-entregue'),
    brandId: kaza.id,
    creatorId: pedro.id,
    title: 'Review headset gamer',
    brief: { ...briefBase, platforms: ['youtube'], formats: ['video'] },
    status: 'delivered',
    offerCents: fromBRL(4_800),
    startsAt: new Date('2026-07-01'),
    endsAt: new Date('2026-07-15'),
    createdAt: new Date('2026-06-20'),
    history: [
      { from: null, to: 'draft', at: addDays(new Date('2026-06-20'), 0) },
      { from: 'draft', to: 'proposed', at: addDays(new Date('2026-06-20'), 3) },
      { from: 'proposed', to: 'accepted', at: addDays(new Date('2026-06-20'), 6) },
      { from: 'accepted', to: 'in_production', at: addDays(new Date('2026-06-20'), 9) },
      { from: 'in_production', to: 'delivered', at: addDays(new Date('2026-06-20'), 12) },
    ],
  };

  const paga: Campaign = {
    id: asCampaignId('campaign-paga'),
    brandId: vervo.id,
    creatorId: lais.id,
    title: 'Kit verão — combo praia',
    brief: { ...briefBase, formats: ['reel', 'feed'] },
    status: 'paid',
    offerCents: fromBRL(9_000),
    startsAt: new Date('2026-05-10'),
    endsAt: new Date('2026-05-30'),
    createdAt: new Date('2026-04-28'),
    history: [
      { from: null, to: 'draft', at: addDays(new Date('2026-04-28'), 0) },
      { from: 'draft', to: 'proposed', at: addDays(new Date('2026-04-28'), 3) },
      { from: 'proposed', to: 'accepted', at: addDays(new Date('2026-04-28'), 6) },
      { from: 'accepted', to: 'in_production', at: addDays(new Date('2026-04-28'), 9) },
      { from: 'in_production', to: 'delivered', at: addDays(new Date('2026-04-28'), 12) },
      { from: 'delivered', to: 'paid', at: addDays(new Date('2026-04-28'), 15) },
    ],
  };

  const recusada: Campaign = {
    id: asCampaignId('campaign-recusada'),
    brandId: kaza.id,
    creatorId: bruna.id,
    title: 'Linha de suplementos',
    brief: briefBase,
    status: 'declined',
    offerCents: fromBRL(1_500),
    startsAt: new Date('2026-06-01'),
    endsAt: new Date('2026-06-15'),
    createdAt: new Date('2026-05-25'),
    history: [
      { from: null, to: 'draft', at: addDays(new Date('2026-05-25'), 0) },
      { from: 'draft', to: 'proposed', at: addDays(new Date('2026-05-25'), 3) },
      { from: 'proposed', to: 'declined', at: addDays(new Date('2026-05-25'), 6) },
    ],
  };

  const postReelVitamina: ScheduledPost = {
    id: asScheduledPostId('post-reel-vitamina'),
    campaignId: producao.id,
    creatorId: bruna.id,
    platform: 'instagram',
    format: 'reel',
    caption: 'Minha rotina matinal com o combo que virou hábito. #parceria',
    hashtags: ['#parceria', '#rotina'],
    scheduledFor: new Date('2026-08-14'),
    status: 'approved',
    publishedAt: null,
  };

  const postStoryAtrasado: ScheduledPost = {
    id: asScheduledPostId('post-story-atrasado'),
    campaignId: producao.id,
    creatorId: bruna.id,
    platform: 'instagram',
    format: 'story',
    caption: 'Bastidores da gravação de hoje!',
    hashtags: ['#bastidores'],
    // Intencionalmente no passado: demonstra o badge de validação em produção.
    scheduledFor: new Date('2026-07-01'),
    status: 'drafting',
    publishedAt: null,
  };

  const postVideoReview: ScheduledPost = {
    id: asScheduledPostId('post-video-review'),
    campaignId: entregue.id,
    creatorId: pedro.id,
    platform: 'youtube',
    format: 'video',
    caption: 'Testei por 2 semanas — vale o preço? Review completo no vídeo.',
    hashtags: ['#review', '#gamer'],
    scheduledFor: new Date('2026-07-10'),
    status: 'published',
    publishedAt: new Date('2026-07-10'),
  };

  const postReelSkincare: ScheduledPost = {
    id: asScheduledPostId('post-reel-skincare'),
    campaignId: negociando.id,
    creatorId: lais.id,
    platform: 'instagram',
    format: 'reel',
    caption: '',
    hashtags: [],
    scheduledFor: new Date('2026-09-01'),
    status: 'idea',
    publishedAt: null,
  };

  const creators = indexBy([lais, pedro, bruna], (c) => c.id);
  const brands = indexBy([vervo, kaza], (b) => b.id);
  const campaigns = indexBy(
    [proposta, negociando, producao, entregue, paga, recusada],
    (c) => c.id,
  );
  const scheduledPosts = indexBy(
    [postReelVitamina, postStoryAtrasado, postVideoReview, postReelSkincare],
    (p) => p.id,
  );

  return { creators, brands, campaigns, scheduledPosts };
}
