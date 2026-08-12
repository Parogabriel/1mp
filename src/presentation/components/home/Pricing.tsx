'use client';

import Link from 'next/link';
import { Card } from '@/presentation/components/ui/Card';
import { BlurReveal } from '@/presentation/components/ui/BlurReveal';
import { EscrowIllustration } from './illustrations/EscrowIllustration';

interface Plan {
  readonly name: string;
  readonly price: string;
  readonly unit: string;
  readonly summary: string;
  readonly features: readonly string[];
  readonly highlighted?: boolean;
}

const PLANS: readonly Plan[] = [
  {
    name: 'Criador',
    price: 'Grátis',
    unit: 'sempre',
    summary: 'Para quem vende a própria audiência.',
    features: [
      'Perfil com métricas auditadas',
      'Board de campanhas e Post Studio',
      'Pagamento em custódia',
      'Sem taxa sobre o seu cachê',
    ],
  },
  {
    name: 'Marca',
    price: '8%',
    unit: 'por campanha fechada',
    summary: 'Para quem contrata e precisa justificar o número.',
    features: [
      'Projeção de retorno antes de assinar',
      'CRM de criadores com filtros',
      'Analytics de ROI com exportação',
      'Contrato e custódia por campanha',
      'Sem mensalidade',
    ],
    highlighted: true,
  },
  {
    name: 'Agência',
    price: 'Sob consulta',
    unit: 'contrato anual',
    summary: 'Para quem opera várias marcas ao mesmo tempo.',
    features: [
      'Tudo do plano Marca',
      'Múltiplas marcas num painel',
      'Taxa reduzida por volume',
      'Suporte dedicado',
    ],
  },
];

/**
 * Preços.
 *
 * A taxa fica no lado da marca e nunca sobre o cachê do criador — é a mesma
 * promessa que a home faz em "0% de comissão oculta", agora com número.
 */
export function Pricing() {
  return (
    <section id="precos" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid gap-8 md:grid-cols-[1.5fr_0.5fr] md:items-center">
        <div className="max-w-2xl">
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: 'var(--violet)' }}
          >
            Preços
          </p>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] font-normal tracking-tight md:text-5xl">
            A conta também é transparente aqui.
          </h2>
          <p className="mt-5 text-ink-muted">
            Taxa só quando a campanha fecha, e só do lado de quem contrata. O criador
            recebe o valor combinado, inteiro.
          </p>
        </div>

        <EscrowIllustration className="hidden w-full max-w-[220px] justify-self-end text-ink md:block" />
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan, i) => (
          <BlurReveal key={plan.name} delay={i * 0.07}>
            <Card
              padding="lg"
              elevation={plan.highlighted ? 'raised' : 'sm'}
              className="flex h-full flex-col"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-normal tracking-tight">
                  {plan.name}
                </h3>
                {plan.highlighted && (
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium tracking-widest uppercase"
                    style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
                  >
                    Mais usado
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-ink-muted">{plan.summary}</p>

              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-4xl leading-none font-light tabular-nums">
                  {plan.price}
                </span>
                <span className="text-xs text-ink-muted">{plan.unit}</span>
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm text-ink-muted">
                    <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/entrar"
                className="rounded-card mt-7 block px-4 py-2.5 text-center text-sm font-medium transition-opacity duration-200 hover:opacity-90"
                style={
                  plan.highlighted
                    ? { background: 'var(--ink)', color: 'var(--surface)' }
                    : { border: 'var(--border-width) solid var(--line)' }
                }
              >
                Começar
              </Link>
            </Card>
          </BlurReveal>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-muted">
        Valores ilustrativos deste ambiente de demonstração.
      </p>
    </section>
  );
}
