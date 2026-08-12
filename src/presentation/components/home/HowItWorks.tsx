'use client';

import { BlurReveal } from '@/presentation/components/ui/BlurReveal';

const STEPS = [
  {
    n: '01',
    title: 'A marca monta o briefing',
    text: 'Objetivo, mensagem-chave, plataformas, formatos e quantas entregas. O orçamento entra aqui e já desconta do saldo disponível.',
    actor: 'Marca',
  },
  {
    n: '02',
    title: 'O motor projeta o retorno',
    text: 'Alcance, impressões, engajamento e ROI aparecem antes do convite sair — calculados sobre a audiência real do criador, com as premissas à vista.',
    actor: 'Plataforma',
  },
  {
    n: '03',
    title: 'Os dois negociam vendo o mesmo número',
    text: 'Nada de print de dashboard. Se a marca discorda do ticket médio, muda o valor e a conta inteira se refaz na frente dos dois.',
    actor: 'Marca e criador',
  },
  {
    n: '04',
    title: 'A produção acontece no fluxo',
    text: 'Briefing aprovado vira board de campanha e planejamento de posts, com validação de formato e prazo por plataforma.',
    actor: 'Criador',
  },
  {
    n: '05',
    title: 'A entrega libera o pagamento',
    text: 'As métricas são lidas na plataforma. Aprovada a entrega, o valor retido em custódia é liberado.',
    actor: 'Plataforma',
  },
] as const;

/**
 * O fluxo completo de uma campanha, em ordem.
 *
 * Cada passo diz de quem é a vez — a confusão mais comum num marketplace de
 * dois lados é não saber quem age em cada etapa.
 *
 * Trilho vertical em vez de grade de cards: cinco cards iguais dizem "cinco
 * coisas", e o que precisa ficar claro aqui é que uma etapa leva à seguinte.
 * A linha contínua é o próprio argumento — "num fluxo só".
 */
export function HowItWorks() {
  return (
    <section id="como-funciona" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24">
      <div className="max-w-2xl">
        <p
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--violet)' }}
        >
          Como funciona
        </p>
        <h2 className="font-display mt-3 text-3xl leading-[1.1] font-normal tracking-tight md:text-5xl">
          Da ideia ao pagamento, num fluxo só.
        </h2>
        <p className="mt-5 text-ink-muted">
          Cinco etapas. Em nenhuma delas alguém precisa acreditar na palavra do outro.
        </p>
      </div>

      <ol className="relative mt-14">
        {/* O trilho. Decorativo: a numeração já dá a ordem para quem não o vê. */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[15px] w-px md:left-[19px]"
          style={{ background: 'var(--line)' }}
        />

        {STEPS.map((step, i) => (
          <li key={step.n} className="relative pb-10 pl-12 last:pb-0 md:pl-16">
            {/* Fora do BlurReveal de propósito: `transform` cria bloco de contenção
                para descendente absoluto, então o marcador ancorado ao `li` sairia
                do lugar durante a animação de entrada. */}
            <span
              aria-hidden="true"
              className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full border-(length:--border-width) border-line bg-surface-raised text-[11px] font-medium tabular-nums md:size-10 md:text-xs"
              style={{ color: 'var(--accent)' }}
            >
              {step.n}
            </span>

            <BlurReveal
              delay={i * 0.06}
              className="grid gap-2 md:grid-cols-[1fr_1.3fr] md:items-baseline md:gap-8"
            >
              <div>
                <h3 className="font-display text-lg leading-snug font-normal tracking-tight md:text-xl">
                  {step.title}
                </h3>
                <p className="mt-1 text-[11px] tracking-widest text-ink-muted uppercase">
                  {step.actor}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </BlurReveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
