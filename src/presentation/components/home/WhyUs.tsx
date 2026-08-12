'use client';

import { Card } from '@/presentation/components/ui/Card';
import { BlurReveal } from '@/presentation/components/ui/BlurReveal';
import { SharedNumberIllustration } from './illustrations/SharedNumberIllustration';

interface Pain {
  readonly problem: string;
  readonly answer: string;
}

const FOR_BRANDS: readonly Pain[] = [
  {
    problem: 'Você fecha a campanha por print de dashboard.',
    answer: 'Alcance e retorno projetados entram na proposta, antes da assinatura.',
  },
  {
    problem: 'O relatório chega quando o dinheiro já saiu.',
    answer: 'As métricas são lidas na plataforma enquanto a campanha corre.',
  },
  {
    problem: 'Não dá para saber se o preço pedido é justo.',
    answer: 'CPM e custo por engajamento projetados dão a régua de comparação.',
  },
  {
    problem: 'O orçamento se perde em planilha.',
    answer: 'Cada campanha desconta do saldo no ato — o disponível é sempre real.',
  },
];

const FOR_CREATORS: readonly Pain[] = [
  {
    problem: 'Você precifica no escuro.',
    answer: 'Seu valor base fica visível ao lado da audiência que o sustenta.',
  },
  {
    problem: 'Metade da conversa é provar que sua entrega vale.',
    answer: 'A projeção fala por você — a marca vê o número antes de perguntar.',
  },
  {
    problem: 'O pagamento depende do calendário financeiro da marca.',
    answer: 'O valor fica retido em custódia desde o aceite, liberado na entrega.',
  },
  {
    problem: 'Briefing chega por mensagem e some.',
    answer: 'Escopo, prazo e uso de imagem ficam registrados na campanha.',
  },
];

/**
 * O argumento em duas colunas, problema à esquerda da resposta.
 *
 * Nomear a dor antes da solução é o que separa "por que usar" de folheto: o
 * leitor precisa se reconhecer no problema para o resto importar.
 */
export function WhyUs() {
  return (
    <section id="por-que" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid gap-8 md:grid-cols-[1.5fr_0.5fr] md:items-center">
        <div className="max-w-2xl">
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: 'var(--violet)' }}
          >
            Por que usar
          </p>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] font-normal tracking-tight md:text-5xl">
            Os dois lados perdem com o achismo.
          </h2>
          <p className="mt-5 text-ink-muted">
            Marca e criador reclamam de coisas diferentes — que são a mesma coisa vista de
            lados opostos.
          </p>
        </div>

        <SharedNumberIllustration className="hidden w-full max-w-[240px] justify-self-end text-ink md:block" />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <PainColumn title="Se você é marca" pains={FOR_BRANDS} />
        <PainColumn title="Se você é criador" pains={FOR_CREATORS} />
      </div>
    </section>
  );
}

function PainColumn({
  title,
  pains,
}: {
  readonly title: string;
  readonly pains: readonly Pain[];
}) {
  return (
    <BlurReveal>
      <Card padding="lg" className="h-full">
        <h3 className="font-display text-xl font-normal tracking-tight">{title}</h3>
        <ul className="mt-6 space-y-5">
          {pains.map((pain) => (
            <li key={pain.problem}>
              <p className="text-sm text-ink-muted line-through decoration-1">
                {pain.problem}
              </p>
              <p className="mt-1.5 flex gap-2 text-sm leading-relaxed">
                <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
                  →
                </span>
                {pain.answer}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </BlurReveal>
  );
}
