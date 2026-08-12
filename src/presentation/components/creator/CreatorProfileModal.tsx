'use client';

import {
  formatBRL,
  tierOf,
  toPercent,
  totalFollowers,
  weightedEngagementRate,
  type Creator,
} from '@/domain';
import { Modal } from '@/presentation/components/ui/Modal';
import { Badge } from '@/presentation/components/ui/Badge';
import { PLATFORM_LABEL } from '@/presentation/labels';

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

interface CreatorProfileModalProps {
  readonly creator: Creator | null;
  readonly onClose: () => void;
}

/**
 * Perfil completo do criador, com quebra por plataforma.
 *
 * O botão "Ver perfil ↗" do card existia sem handler nenhum — era um controle
 * morto desde que foi desenhado. E `audiences[]` guarda seguidores,
 * engajamento e alcance de cada rede, mas a aplicação só exibia
 * `audiences[0].handle`, jogando o resto fora.
 */
export function CreatorProfileModal({ creator, onClose }: CreatorProfileModalProps) {
  if (!creator) return null;

  const followers = totalFollowers(creator);

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={`${creator.location.city}${creator.location.uf ? `, ${creator.location.uf}` : ''}`}
      title={creator.displayName}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="violet">{tierOf(creator)}</Badge>
        {creator.verified && <Badge tone="accent">✓ Verificado</Badge>}
        {creator.niches.map((niche) => (
          <Badge key={niche} tone="lime">
            {niche}
          </Badge>
        ))}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card border-(length:--border-width) border-line sm:grid-cols-4"
        style={{ background: 'var(--line)' }}
      >
        <Cell label="Alcance total" value={compact.format(followers)} />
        <Cell
          label="Engajamento"
          value={`${toPercent(weightedEngagementRate(creator)).toFixed(1)}%`}
          tone="var(--accent)"
        />
        <Cell label="Por campanha" value={formatBRL(creator.baseRateCents)} />
        <Cell label="Concluídas" value={String(creator.completedCampaigns)} />
      </dl>

      <h3 className="mt-8 text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">
        Por plataforma
      </h3>
      <ul className="mt-4 space-y-4">
        {creator.audiences.map((audience) => {
          const share = followers === 0 ? 0 : audience.followers / followers;
          return (
            <li key={`${audience.platform}-${audience.handle}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium">
                  {PLATFORM_LABEL[audience.platform]}
                </span>
                <span className="text-xs text-ink-muted">{audience.handle}</span>
              </div>

              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full"
                style={{ background: 'color-mix(in srgb, var(--ink) 8%, transparent)' }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${share * 100}%`, background: 'var(--accent)' }}
                />
              </div>

              <p className="mt-1.5 text-xs tabular-nums text-ink-muted">
                {compact.format(audience.followers)} seguidores ·{' '}
                {toPercent(audience.engagementRate).toFixed(1)}% engajamento
                {audience.avgReach > 0
                  ? ` · ${compact.format(audience.avgReach)} de alcance médio`
                  : ' · sem alcance histórico'}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-7 text-xs leading-relaxed text-ink-muted">
        Na plataforma desde {monthFormatter.format(creator.joinedAt)}. O alcance médio
        alimenta a projeção de retorno — quando não existe histórico, o motor usa um
        índice de referência da rede em vez de assumir que todo seguidor vê o post.
      </p>
    </Modal>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone?: string;
}) {
  return (
    <div className="bg-surface-raised px-4 py-3">
      <dt className="text-[11px] tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd
        className="font-display mt-1 text-xl leading-none font-light tabular-nums"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
