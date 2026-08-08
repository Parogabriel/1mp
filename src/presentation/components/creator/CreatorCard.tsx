'use client';

import { useRef, type ReactNode } from 'react';
import {
  formatBRL,
  tierOf,
  totalFollowers,
  weightedEngagementRate,
  toPercent,
  type Creator,
  type CreatorTier,
} from '@/domain';
import { Badge, type BadgeTone } from '@/presentation/components/ui/Badge';
import { useGsapButtonPress } from '@/presentation/hooks/useGsapButtonPress';

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact' });

const TIER_LABEL: Readonly<Record<CreatorTier, string>> = {
  nano: 'Nano',
  micro: 'Micro',
  mid: 'Médio',
  macro: 'Macro',
  mega: 'Mega',
};

const TIER_TONE: Readonly<Record<CreatorTier, BadgeTone>> = {
  nano: 'amber',
  micro: 'lime',
  mid: 'violet',
  macro: 'signal',
  mega: 'accent',
};

/** Iniciais do nome — fallback quando o criador ainda não subiu foto. */
const initialsOf = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

interface CreatorCardProps {
  readonly creator: Creator;
  /** Ação secundária opcional (favoritar/remover no CRM da marca). */
  readonly action?: { readonly label: string; readonly onClick: () => void };
}

export function CreatorCard({ creator, action }: CreatorCardProps) {
  const ctaRef = useRef<HTMLButtonElement>(null);
  useGsapButtonPress(ctaRef);

  const tier = tierOf(creator);
  const followers = totalFollowers(creator);
  const engagement = toPercent(weightedEngagementRate(creator));
  const primaryHandle = creator.audiences[0]?.handle ?? '';
  const primaryNiche = creator.niches[0];

  return (
    <article
      className="group relative flex flex-col overflow-hidden border-(length:--border-width) border-line bg-surface-raised p-5 transition-transform duration-200 hover:-translate-y-1"
      style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard-sm)' }}
    >
      {/* Brilho de topo: aparece no hover e some junto, sem repintar o card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(ellipse 60% 100% at 50% 0%, var(--violet), transparent 70%)',
        }}
      />

      <header className="relative flex items-start gap-3.5">
        <Avatar creator={creator} initials={initialsOf(creator.displayName)} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display truncate text-base leading-tight font-bold tracking-tight">
              {creator.displayName}
            </h3>
            {creator.verified && <VerifiedSeal />}
          </div>
          <p className="mt-0.5 truncate font-mono text-xs text-ink-muted">{primaryHandle}</p>

          <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-muted">
            <MapPinIcon />
            <span className="truncate">
              {creator.location.city}
              {creator.location.uf && `, ${creator.location.uf}`}
            </span>
          </p>
        </div>
      </header>

      <div className="relative mt-3.5 flex flex-wrap gap-1.5">
        <Badge tone={TIER_TONE[tier]}>{TIER_LABEL[tier]}</Badge>
        {primaryNiche && <Badge tone="violet">{primaryNiche}</Badge>}
      </div>

      {/* Bloco de métricas destacado do resto do card por fundo + borda. */}
      <dl
        className="relative mt-4 grid grid-cols-3 gap-px overflow-hidden border-(length:--border-width) border-line"
        style={{ borderRadius: 'calc(var(--radius) - 8px)', background: 'var(--line)' }}
      >
        <Metric label="Seguidores" value={compact.format(followers)} />
        <Metric
          label="Engajamento"
          value={`${engagement.toFixed(1)}%`}
          tone="var(--accent)"
        />
        <Metric label="Por campanha" value={formatBRL(creator.baseRateCents)} />
      </dl>

      <p className="relative mt-3 text-[11px] text-ink-muted">
        {creator.completedCampaigns} campanha{creator.completedCampaigns === 1 ? '' : 's'}{' '}
        concluída{creator.completedCampaigns === 1 ? '' : 's'} na plataforma
      </p>

      <footer className="relative mt-4 flex items-center gap-2">
        <button
          ref={ctaRef}
          type="button"
          className="flex-1 border-(length:--border-width) border-line px-4 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 hover:bg-ink hover:text-surface"
          style={{ borderRadius: 'var(--radius-pill)' }}
        >
          Ver perfil ↗
        </button>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="shrink-0 border-(length:--border-width) border-line px-3 py-2.5 text-[11px] font-bold tracking-widest uppercase hover:opacity-70"
            style={{ borderRadius: 'var(--radius-pill)' }}
          >
            {action.label}
          </button>
        )}
      </footer>
    </article>
  );
}

function Avatar({ creator, initials }: { readonly creator: Creator; readonly initials: string }) {
  return (
    <div className="relative shrink-0">
      {/* Moldura brilhante: anel em gradiente com o avatar recortado por dentro. */}
      <div
        aria-hidden="true"
        className="absolute -inset-0.5"
        style={{
          background: 'linear-gradient(140deg, var(--violet), var(--accent), var(--amber))',
          borderRadius: 'var(--radius-pill)',
        }}
      />
      {creator.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL externa arbitrária; next/image exigiria allowlist de domínio.
        <img
          src={creator.avatarUrl}
          alt=""
          className="relative size-14 object-cover"
          style={{ borderRadius: 'var(--radius-pill)' }}
        />
      ) : (
        <span
          aria-hidden="true"
          className="font-display relative flex size-14 items-center justify-center text-base font-bold"
          style={{
            background: 'var(--surface)',
            color: 'var(--violet)',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function VerifiedSeal() {
  return (
    <span
      title="Criador verificado"
      className="inline-flex shrink-0 items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase"
      style={{
        background: 'var(--accent)',
        color: 'var(--accent-ink)',
        borderRadius: 'var(--radius-pill)',
      }}
    >
      <span aria-hidden="true">✓</span>
      <span className="sr-only">Criador verificado — </span>Pro
    </span>
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
    <div className="bg-surface-raised px-2.5 py-2.5 text-center">
      <dt className="text-[9px] leading-tight tracking-widest text-ink-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm font-bold" style={tone ? { color: tone } : undefined}>
        {value}
      </dd>
    </div>
  );
}

function MapPinIcon(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="size-3 shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
