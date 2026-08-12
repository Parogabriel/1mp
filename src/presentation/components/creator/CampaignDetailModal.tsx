'use client';

import {
  durationInDays,
  formatBRL,
  type Campaign,
} from '@/domain';
import { Modal } from '@/presentation/components/ui/Modal';
import { Badge } from '@/presentation/components/ui/Badge';
import { FORMAT_LABEL, PLATFORM_LABEL } from '@/presentation/labels';
import { STATUS_LABEL, STATUS_TONE } from './campaignLabels';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

interface CampaignDetailModalProps {
  readonly campaign: Campaign | null;
  readonly brandName: string;
  readonly onClose: () => void;
}

/**
 * O briefing inteiro e a linha do tempo da campanha.
 *
 * Até aqui o `brief` — objetivo, mensagem-chave, plataformas, formatos,
 * entregas, o que mencionar e o que evitar — era gravado no domínio e **nunca
 * exibido em lugar nenhum da aplicação**. Quem ia produzir a campanha não tinha
 * onde ler o que a marca pediu.
 */
export function CampaignDetailModal({
  campaign,
  brandName,
  onClose,
}: CampaignDetailModalProps) {
  return (
    <Modal
      open={campaign !== null}
      onClose={onClose}
      eyebrow={campaign ? brandName : undefined}
      title={campaign?.title ?? ''}
    >
      {campaign && (
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[campaign.status]}>
              {STATUS_LABEL[campaign.status]}
            </Badge>
            <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--accent)' }}>
              {formatBRL(campaign.offerCents)}
            </span>
            <span className="text-xs text-ink-muted">
              {dateFormatter.format(campaign.startsAt)} até{' '}
              {dateFormatter.format(campaign.endsAt)} · {durationInDays(campaign)} dias
            </span>
          </div>

          <section aria-labelledby="brief-objetivo">
            <SectionTitle id="brief-objetivo">Objetivo</SectionTitle>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {campaign.brief.objective || 'Sem objetivo declarado.'}
            </p>

            <SectionTitle className="mt-5">Mensagem-chave</SectionTitle>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {campaign.brief.keyMessage || 'Sem mensagem-chave declarada.'}
            </p>
          </section>

          <section aria-labelledby="brief-entrega">
            <SectionTitle id="brief-entrega">Entrega</SectionTitle>
            <dl className="mt-3 grid gap-3 sm:grid-cols-3">
              <Detail label="Plataformas">
                {campaign.brief.platforms.map((p) => PLATFORM_LABEL[p]).join(', ') || '—'}
              </Detail>
              <Detail label="Formatos">
                {campaign.brief.formats.map((f) => FORMAT_LABEL[f]).join(', ') || '—'}
              </Detail>
              <Detail label="Publicações">
                <span className="tabular-nums">{campaign.brief.deliverableCount}</span>
              </Detail>
            </dl>
          </section>

          {(campaign.brief.mustMention.length > 0 ||
            campaign.brief.mustAvoid.length > 0) && (
            <section aria-labelledby="brief-regras" className="grid gap-5 sm:grid-cols-2">
              <div>
                <SectionTitle id="brief-regras">Deve mencionar</SectionTitle>
                <TagList items={campaign.brief.mustMention} tone="accent" empty="Nada obrigatório." />
              </div>
              <div>
                <SectionTitle>Deve evitar</SectionTitle>
                <TagList items={campaign.brief.mustAvoid} tone="signal" empty="Nenhuma restrição." />
              </div>
            </section>
          )}

          <section aria-labelledby="brief-historico">
            <SectionTitle id="brief-historico">Linha do tempo</SectionTitle>
            {campaign.history.length === 0 ? (
              <p className="mt-2 text-xs text-ink-muted">
                Sem histórico registrado para esta campanha.
              </p>
            ) : (
              <ol className="mt-3 space-y-0">
                {campaign.history.map((event, i) => {
                  const last = i === campaign.history.length - 1;
                  return (
                    <li key={`${event.to}-${event.at.getTime()}`} className="flex gap-3">
                      {/* Trilho contínuo: o traço liga um marco ao seguinte e
                          para no último, marcando onde a campanha está agora. */}
                      <div className="flex flex-col items-center">
                        <span
                          className="mt-1.5 size-2 shrink-0 rounded-full"
                          style={{
                            background: last ? 'var(--accent)' : 'var(--ink-muted)',
                          }}
                        />
                        {!last && <span className="w-px flex-1 bg-line" />}
                      </div>

                      <div className={last ? 'pb-0' : 'pb-4'}>
                        <p className="text-sm">
                          {event.from === null
                            ? 'Campanha criada'
                            : `${STATUS_LABEL[event.from]} → ${STATUS_LABEL[event.to]}`}
                        </p>
                        <p className="mt-0.5 text-xs tabular-nums text-ink-muted">
                          {dateTimeFormatter.format(event.at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}

function SectionTitle({
  children,
  id,
  className = '',
}: {
  readonly children: React.ReactNode;
  readonly id?: string;
  readonly className?: string;
}) {
  return (
    <h3
      id={id}
      className={`text-xs font-medium tracking-[0.2em] text-ink-muted uppercase ${className}`}
    >
      {children}
    </h3>
  );
}

function Detail({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border-(length:--border-width) border-line px-3.5 py-2.5">
      <dt className="text-[11px] tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function TagList({
  items,
  tone,
  empty,
}: {
  readonly items: readonly string[];
  readonly tone: 'accent' | 'signal';
  readonly empty: string;
}) {
  if (items.length === 0) {
    return <p className="mt-2 text-xs text-ink-muted">{empty}</p>;
  }

  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <Badge tone={tone}>{item}</Badge>
        </li>
      ))}
    </ul>
  );
}
