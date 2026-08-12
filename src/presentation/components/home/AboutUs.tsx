'use client';

import { BrandSeal } from '@/presentation/components/ui/BrandSeal';
import { Card } from '@/presentation/components/ui/Card';
import { BlurReveal } from '@/presentation/components/ui/BlurReveal';
import { Parallax } from '@/presentation/components/ui/Parallax';

const PRINCIPLES = [
  {
    title: 'Número antes da assinatura',
    text: 'Se a conta só aparece no relatório, ela virou justificativa. Aqui ela é insumo de negociação.',
  },
  {
    title: 'A mesma conta para os dois',
    text: 'Marca e criador veem o mesmo motor, com as mesmas premissas. Não há versão "de venda" e versão "real".',
  },
  {
    title: 'Premissa à vista, sempre',
    text: 'Ticket médio, margem e conversão ficam impressos junto do resultado. Discordar é parte do processo.',
  },
  {
    title: 'Margem, não receita bruta',
    text: 'ROI sobre margem de contribuição. Receita bruta infla o retorno e engana quem decide.',
  },
] as const;

/**
 * Quem somos: a origem do produto e os princípios que sustentam as decisões.
 *
 * O texto reaproveita o painel "Plataforma" da navegação, mas desenvolvido —
 * o modal é o resumo, esta seção é a versão inteira.
 */
export function AboutUs() {
  return (
    <section id="quem-somos" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <Parallax distance={28}>
          <div className="lg:sticky lg:top-24">
            <BrandSeal size={92} className="text-ink" />
            <p
              className="tabular-nums mt-6 text-xs font-medium tracking-widest uppercase"
              style={{ color: 'var(--violet)' }}
            >
              Quem somos
            </p>
            <h2 className="font-display mt-3 text-3xl leading-[1.1] font-normal tracking-tight md:text-4xl">
              Nascemos de um incômodo simples.
            </h2>
          </div>
        </Parallax>

        <div>
          <div className="space-y-5 text-base leading-relaxed text-ink-muted">
            <p>
              Em marketing de influência, o número sempre chega tarde. A marca fecha a
              campanha com base em print de dashboard e promessa de alcance, e só
              descobre o que comprou semanas depois, no relatório — quando o dinheiro já
              saiu e não há mais o que negociar.
            </p>
            <p>
              Do outro lado, o criador vive o espelho do mesmo problema. Precifica no
              escuro, sem referência do que o mercado paga por audiência parecida com a
              dele, e passa boa parte da negociação provando que a própria entrega vale
              o que cobra.
            </p>
            <p>
              A 1MP existe para inverter essa ordem. Alcance, impressões, engajamento e
              retorno projetado entram na mesa{' '}
              <strong className="text-ink">antes</strong> da assinatura, calculados pelo
              mesmo motor para os dois lados.
            </p>
            <p>
              O nome vem daí:{' '}
              <span className="text-ink">One Million Posts</span>. Não é sobre volume de
              publicação, e sim sobre a ideia de que cada post é uma transação que
              deveria ser mensurável antes de acontecer.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((principle, i) => (
              <BlurReveal key={principle.title} delay={i * 0.06}>
                <Card padding="md" className="h-full">
                  <h3 className="text-sm font-medium">{principle.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                    {principle.text}
                  </p>
                </Card>
              </BlurReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
