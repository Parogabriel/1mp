'use client';

import { useMemo } from 'react';
import type { Creator } from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { BlurReveal } from '@/presentation/components/ui/BlurReveal';

/**
 * O que cada persona do ambiente diria — indexado pelo id do criador do seed.
 *
 * A fala é redação; quem fala, não. Nome, cidade e nicho vêm da store, então uma
 * persona removida do seed some daqui junto, em vez de virar depoimento órfão de
 * alguém que a aplicação não conhece mais.
 */
const QUOTES: Readonly<Record<string, { readonly quote: string; readonly context: string }>> = {
  'creator-lais': {
    quote:
      'Antes eu passava metade da conversa provando que a minha entrega valia o que eu cobrava. Agora a projeção abre junto com a proposta e a conversa começa no preço, não na desconfiança.',
    context: 'sobre negociar com a projeção à vista',
  },
  'creator-pedro': {
    quote:
      'O briefing parava numa thread de mensagens e ninguém lembrava o que tinha sido combinado. Aqui escopo e prazo ficam na campanha — e o histórico mostra quem mudou o quê.',
    context: 'sobre o registro da campanha',
  },
  'creator-bruna': {
    quote:
      'Receber deixou de depender do calendário financeiro da marca. O valor fica retido no aceite e é liberado quando a entrega é aprovada.',
    context: 'sobre pagamento em custódia',
  },
};

interface Testimonial {
  readonly creator: Creator;
  readonly quote: string;
  readonly context: string;
}

/**
 * Depoimentos das personas do ambiente.
 *
 * Prova social é o lugar onde uma landing page mente com mais facilidade, então
 * a regra aqui é explícita: só personas que a aplicação já exibe, e a seção diz
 * na cara que são ilustrativas. Nenhuma pessoa ou empresa real é citada.
 *
 * A forma foge da grade de três cards de propósito — uma fala grande puxando as
 * outras duas, para a dobra ter hierarquia em vez de três blocos iguais.
 */
export function Testimonials() {
  const creators = useWorkspaceStore((s) => s.creators);

  const testimonials = useMemo<readonly Testimonial[]>(
    () =>
      Object.values(creators)
        .map((creator) => {
          const entry = QUOTES[creator.id];
          return entry ? { creator, ...entry } : null;
        })
        .filter((t): t is Testimonial => t !== null),
    [creators],
  );

  if (testimonials.length === 0) return null;

  const [lead, ...rest] = testimonials;
  if (!lead) return null;

  return (
    <section id="depoimentos" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <BlurReveal>
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: 'var(--violet)' }}
          >
            Vozes do ambiente
          </p>

          <figure className="mt-6">
            <blockquote className="font-display text-2xl leading-[1.25] font-normal tracking-tight md:text-[2rem]">
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
                “
              </span>
              {lead.quote}
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
                ”
              </span>
            </blockquote>
            <Attribution testimonial={lead} />
          </figure>
        </BlurReveal>

        <ul className="space-y-8 lg:pt-14">
          {rest.map((testimonial, i) => (
            <li key={testimonial.creator.id}>
              <BlurReveal delay={0.08 + i * 0.08}>
                <figure className="border-l-2 pl-6" style={{ borderColor: 'var(--line)' }}>
                  <blockquote className="text-[15px] leading-relaxed text-ink-muted">
                    {testimonial.quote}
                  </blockquote>
                  <Attribution testimonial={testimonial} compact />
                </figure>
              </BlurReveal>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-12 text-xs text-ink-muted">
        Depoimentos ilustrativos, atribuídos às personas fictícias deste ambiente de
        demonstração. Nenhuma pessoa ou empresa real foi citada.
      </p>
    </section>
  );
}

function Attribution({
  testimonial,
  compact = false,
}: {
  readonly testimonial: Testimonial;
  readonly compact?: boolean;
}) {
  const { creator, context } = testimonial;
  const handle = creator.audiences[0]?.handle;

  return (
    <figcaption className={compact ? 'mt-3' : 'mt-6'}>
      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
        {creator.displayName}
        {creator.verified && (
          <span
            className="rounded-full px-2 py-0.5 text-[11px] tracking-widest uppercase"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            Verificado
          </span>
        )}
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">
        {handle ? `${handle} · ` : ''}
        {creator.location.city}
        {creator.location.uf ? `/${creator.location.uf}` : ''} — {context}
      </p>
    </figcaption>
  );
}
