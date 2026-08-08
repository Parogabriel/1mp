import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  asBrandId,
  asCampaignId,
  asCreatorId,
  asScheduledPostId,
  fromBRL,
  fromPercent,
  kanbanColumnOf,
  transitionTo,
  withFavorite,
  withoutFavorite,
  InvalidTransitionError,
  type Brand,
  type BrandId,
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
 * JSON.stringify transforma Date em string ISO e o parse devolve string — o tipo
 * continua dizendo `Date`, mas em runtime não é. Sem esta passagem, `transitionTo`,
 * `validatePost` e qualquer `Intl.format` quebram depois de um reload, e o bug
 * aparece longe daqui. Precisa vir ANTES de `create(persist(...))`: o `merge` da
 * store roda de forma síncrona durante a criação (não em um efeito depois), então
 * qualquer `const` que ele referencie tem que já estar inicializada nesse ponto —
 * senão é `ReferenceError` de temporal dead zone, e o zustand engole o erro sem
 * avisar (a store some, quieta, e volta pro estado vazio).
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

/**
 * Perfil de vitrine dos criadores do seed, por id.
 *
 * Fica fora de `buildSeedData` porque a migração de estado persistido também
 * precisa dele — declarado antes de `create()` de propósito: `merge` roda
 * síncrono na criação da store e leria a const na temporal dead zone.
 */
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
 * Migra criadores salvos antes de `location`/`verified`/`avatarUrl` existirem.
 *
 * Sem isso a UI lê `location.city` de `undefined` e a tela quebra. Criadores do
 * seed recuperam o perfil real pelo id — quem semeou antes desta versão não
 * precisa semear de novo; campanhas e posts do usuário ficam intactos.
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
    campaigns: mapValues(campaigns, (c) => ({
      ...c,
      startsAt: asDate(c.startsAt),
      endsAt: asDate(c.endsAt),
      createdAt: asDate(c.createdAt),
    })) as Readonly<Record<CampaignId, Campaign>>,
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
      // Nasce com os dados de demonstração em vez de vazia.
      //
      // A vitrine da home e o CRM da marca somem quando não há criadores, e
      // antes disso só o One-Click Seed do God Mode — atrás de passcode —
      // populava a store. Quem chegasse com localStorage limpo via um site pela
      // metade. Estado persistido, quando existe, sobrescreve isto no `merge`.
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
          createdAt: new Date(),
        };
        set({ campaigns: { ...get().campaigns, [campaign.id]: campaign } });
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
 * Derivações puras sobre as coleções da store.
 *
 * Elas recebem o Record cru em vez de `WorkspaceState` de propósito. No Zustand v5
 * o snapshot é comparado por identidade: um selector que monta um objeto/array novo
 * a cada chamada nunca "estabiliza" e derruba o componente em re-render infinito.
 * Assinando a coleção crua (referência estável) e derivando dentro de `useMemo`,
 * o recálculo acontece só quando a coleção muda de verdade.
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
 * Declaração de função, não `const` de arrow: `buildSeedData` roda durante a
 * criação da store (o estado inicial já nasce semeado) e é hoisted, mas um
 * `const` declarado depois do `create()` ainda estaria na temporal dead zone
 * nesse instante — dava `Cannot access 'indexBy' before initialization`.
 */
function indexBy<K extends string, T>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Record<K, T> {
  const result = {} as Record<K, T>;
  for (const item of items) result[keyOf(item)] = item;
  return result;
}

/**
 * Ids nomeados em vez de indexar arrays por posição.
 *
 * Com `noUncheckedIndexedAccess`, `list[2].id` tipa como `Campaign | undefined`
 * e cada uso viraria um `!` — const nomeada é mais segura e mais legível.
 */
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
