'use client';

import { Card } from '@/presentation/components/ui/Card';

const QUESTIONS = [
  {
    q: 'De onde vem o número da projeção?',
    a: 'Do alcance médio observado nos últimos 30 dias em cada plataforma do criador. Quando não há histórico, o motor usa um índice de referência por rede em vez de assumir que todo seguidor vê o post. O engajamento é ponderado pelo tamanho de cada audiência.',
  },
  {
    q: 'A projeção é uma garantia de resultado?',
    a: 'Não, e dizemos isso na própria tela. É uma estimativa com premissas declaradas — ticket médio, margem de contribuição e taxa de conversão — que qualquer um dos lados pode contestar e ajustar durante a negociação.',
  },
  {
    q: 'Por que ROI sobre margem e não sobre receita?',
    a: 'Receita bruta infla o retorno e engana quem decide. Uma campanha que gera R$ 100 mil em vendas com 12% de margem não devolveu R$ 100 mil. O motor calcula sobre a contribuição, que é o que sobra de fato.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'O valor fica retido em custódia a partir do aceite e é liberado quando a marca aprova a entrega. O criador não depende do calendário financeiro da marca, e a marca não paga antes de receber.',
  },
  {
    q: 'Quem pode ter o selo de verificado?',
    a: 'Criadores que passaram por conferência de identidade e de posse das contas declaradas. O selo é promessa contratual, não enfeite de perfil.',
  },
  {
    q: 'A plataforma cobra comissão?',
    a: 'Há uma taxa por campanha fechada, definida e visível. O que não existe é comissão oculta embutida no valor do criador.',
  },
] as const;

/**
 * Perguntas frequentes em `<details>` nativo.
 *
 * Acordeão nativo em vez de estado em React: já vem com teclado, semântica de
 * expansão e busca do navegador (Ctrl+F acha texto dentro do fechado nos
 * navegadores modernos) sem nada disso precisar ser reimplementado.
 */
export function Faq() {
  return (
    <section id="perguntas" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-24">
      <div className="max-w-2xl">
        <p
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--violet)' }}
        >
          Perguntas frequentes
        </p>
        <h2 className="font-display mt-3 text-3xl leading-[1.1] font-normal tracking-tight md:text-4xl">
          O que costumam perguntar.
        </h2>
      </div>

      <div className="mt-10 space-y-3">
        {QUESTIONS.map((item) => (
          <Card as="details" key={item.q} padding="none" className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium">
              {item.q}
              <span
                aria-hidden="true"
                className="shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">{item.a}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
