'use client';

import { useMemo } from 'react';
import {
  formatBRL,
  toPercent,
  totalFollowers,
  tierOf,
  weightedEngagementRate,
  isTerminal,
  cents,
  type Campaign,
  type Cents,
  type CampaignStatus,
  type CreatorId,
} from '@/domain';
import {
  useWorkspaceStore,
  selectCampaignsByCreator,
  selectPostsByCreator,
} from '@/application/stores/useWorkspaceStore';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { PLATFORM_LABEL } from '@/presentation/labels';
import { STATUS_LABEL, STATUS_TONE } from './campaignLabels';

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });
const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Status que já viraram dinheiro no bolso. */
const PAID: CampaignStatus = 'paid';
/** Status em que o valor está acordado mas ainda não pago. */
const CONTRACTED: readonly CampaignStatus[] = [
  'accepted',
  'in_production',
  'delivered',
];

interface CreatorOverviewProps {
  readonly creatorId: CreatorId | null;
}

/**
 * Retrato do criador: dinheiro recebido e contratado, audiência por plataforma,
 * o que está em aberto e o que vence primeiro.
 *
 * Usa `audiences[]` por completo — até aqui a aplicação só mostrava
 * `audiences[0].handle` e jogava fora a quebra por rede.
 */
export function CreatorOverview({ creatorId }: CreatorOverviewProps) {
  const allCampaigns = useWorkspaceStore((s) => s.campaigns);
  const allPosts = useWorkspaceStore((s) => s.scheduledPosts);
  const creators = useWorkspaceStore((s) => s.creators);
  const brands = useWorkspaceStore((s) => s.brands);

  const creator = creatorId ? creators[creatorId] : undefined;

  const campaigns = useMemo(
    () => selectCampaignsByCreator(allCampaigns, creatorId),
    [allCampaigns, creatorId],
  );

  /*
   * "Próximas entregas" = o que ainda não foi publicado, por data.
   *
   * Antes o filtro era `scheduledFor >= Date.now()`, que tinha dois problemas: ler
   * o relógio durante o render é impuro, e post com data vencida e ainda não
   * publicado — justamente o que o criador precisa ver aqui — desaparecia da lista.
   * O status responde a mesma pergunta sem consultar a hora.
   */
  const posts = useMemo(
    () =>
      [...selectPostsByCreator(allPosts, creatorId)]
        .filter((p) => p.status !== 'published')
        .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime()),
    [allPosts, creatorId],
  );

  const money = useMemo(() => summarizeEarnings(campaigns), [campaigns]);
  const active = useMemo(() => campaigns.filter((c) => !isTerminal(c.status)), [campaigns]);

  if (!creator) {
    return (
      <EmptyState
        title="Perfil não encontrado"
        description="A sessão aponta para um criador que não está mais na base de demonstração."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Recebido" value={formatBRL(money.paid)} tone="accent" />
        <Metric label="Contratado" value={formatBRL(money.contracted)} hint="ainda não pago" />
        <Metric label="Campanhas ativas" value={String(active.length)} />
        <Metric label="Concluídas" value={String(creator.completedCampaigns)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card padding="lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-normal tracking-tight">
                Sua audiência
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                {creator.location.city}
                {creator.location.uf && `, ${creator.location.uf}`} ·{' '}
                {compact.format(totalFollowers(creator))} no total ·{' '}
                {toPercent(weightedEngagementRate(creator)).toFixed(1)}% ponderado
              </p>
            </div>
            <Badge tone="violet">{tierOf(creator)}</Badge>
          </div>

          <ul className="mt-5 space-y-3">
            {creator.audiences.map((audience) => {
              const share =
                totalFollowers(creator) === 0
                  ? 0
                  : audience.followers / totalFollowers(creator);
              return (
                <li key={`${audience.platform}-${audience.handle}`}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium">{PLATFORM_LABEL[audience.platform]}</span>
                    <span className="tabular-nums text-xs text-ink-muted">
                      {audience.handle}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full"
                    style={{ background: 'color-mix(in srgb, var(--ink) 8%, transparent)' }}
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${share * 100}%`, background: 'var(--accent)' }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {compact.format(audience.followers)} seguidores ·{' '}
                    {toPercent(audience.engagementRate).toFixed(1)}% engajamento
                    {audience.avgReach > 0 &&
                      ` · ${compact.format(audience.avgReach)} de alcance médio`}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card padding="lg">
          <h3 className="font-display text-lg font-normal tracking-tight">Próximas entregas</h3>
          {posts.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                compact
                title="Nada agendado à frente"
                description="Os posts que você planejar no Post Studio aparecem aqui em ordem de data."
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {posts.slice(0, 5).map((post) => {
                const campaign = allCampaigns[post.campaignId];
                return (
                  <li key={post.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-medium">
                        {campaign?.title ?? 'Campanha removida'}
                      </p>
                      <span className="shrink-0 tabular-nums text-[11px] text-ink-muted">
                        {dayFormatter.format(post.scheduledFor)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {PLATFORM_LABEL[post.platform]} ·{' '}
                      {post.caption || 'Sem legenda ainda'}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card padding="lg">
        <h3 className="font-display text-lg font-normal tracking-tight">Campanhas em aberto</h3>
        {active.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              compact
              title="Nenhuma campanha em aberto"
              description="Propostas novas aparecem aqui assim que uma marca te convidar."
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {active.map((campaign) => (
              <li key={campaign.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{campaign.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {brands[campaign.brandId]?.tradeName ?? 'Marca removida'}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[campaign.status]}>
                  {STATUS_LABEL[campaign.status]}
                </Badge>
                <span className="shrink-0 tabular-nums text-xs font-medium">
                  {formatBRL(campaign.offerCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/** Separa o que já foi pago do que está acordado mas ainda em produção. */
function summarizeEarnings(campaigns: readonly Campaign[]): {
  paid: Cents;
  contracted: Cents;
} {
  let paid = 0;
  let contracted = 0;

  for (const campaign of campaigns) {
    if (campaign.status === PAID) paid += campaign.offerCents;
    else if (CONTRACTED.includes(campaign.status)) contracted += campaign.offerCents;
  }

  // Soma de inteiros continua inteira; `cents` revalida em vez de eu afirmar.
  return { paid: cents(paid), contracted: cents(contracted) };
}

function Metric({
  label,
  value,
  tone,
  hint,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone?: 'accent';
  readonly hint?: string;
}) {
  return (
    <Card padding="md">
      <dt className="text-[11px] tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd
        className="font-display mt-1.5 text-2xl font-normal"
        style={tone === 'accent' ? { color: 'var(--accent)' } : undefined}
      >
        {value}
      </dd>
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </Card>
  );
}
