'use client';

import { Modal } from '@/presentation/components/ui/Modal';
import { CreatorsExplorer } from '@/presentation/components/home/CreatorsExplorer';

export type NavPanelKey = 'plataforma' | 'projecao' | 'criadores' | 'garantias';

export const NAV_PANELS: ReadonlyArray<{ key: NavPanelKey; label: string }> = [
  { key: 'plataforma', label: 'Plataforma' },
  { key: 'projecao', label: 'Projeção' },
  { key: 'criadores', label: 'Criadores' },
  { key: 'garantias', label: 'Garantias' },
];

const TITLES: Readonly<Record<NavPanelKey, { eyebrow: string; title: string }>> = {
  plataforma: { eyebrow: 'A plataforma', title: 'Por que a 1MP existe' },
  projecao: { eyebrow: 'Projeção', title: 'Como o número aparece antes do aceite' },
  criadores: { eyebrow: 'Criadores', title: 'Quem está na plataforma' },
  garantias: { eyebrow: 'Garantias', title: 'O que já protegemos — e o que vem' },
};

interface NavPanelsProps {
  readonly openKey: NavPanelKey | null;
  readonly onClose: () => void;
}

export function NavPanels({ openKey, onClose }: NavPanelsProps) {
  const meta = openKey ? TITLES[openKey] : null;

  return (
    <Modal
      open={openKey !== null}
      onClose={onClose}
      eyebrow={meta?.eyebrow}
      title={meta?.title ?? ''}
    >
      {openKey === 'plataforma' && <Plataforma />}
      {openKey === 'projecao' && <Projecao />}
      {openKey === 'criadores' && <CreatorsExplorer />}
      {openKey === 'garantias' && <Garantias />}
    </Modal>
  );
}

function Plataforma() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-ink-muted md:text-[15px]">
      <p>
        A 1MP nasceu de um incômodo simples: em marketing de influência, o número
        sempre chega tarde. A marca fecha a campanha com base em print de dashboard e
        promessa de alcance, e só descobre o que comprou semanas depois, no relatório —
        quando o dinheiro já saiu e não há mais o que negociar.
      </p>
      <p>
        Do outro lado, o criador vive o espelho do mesmo problema. Precifica no escuro,
        sem referência do que o mercado paga por audiência parecida com a dele, e passa
        boa parte da negociação provando que a própria entrega vale o que cobra.
      </p>
      <p>
        A intenção do produto é inverter essa ordem. Alcance, impressões, engajamento e
        retorno projetado entram na mesa <strong className="text-ink">antes</strong> da
        assinatura, calculados pelo mesmo motor para os dois lados. Marca e criador
        discutem a mesma conta, com as mesmas premissas visíveis — ticket médio, margem
        de contribuição, taxa de conversão.
      </p>
      <p>
        O nome vem daí: One Million Posts. Não é sobre volume de publicação, e sim sobre
        a ideia de que cada post é uma transação que deveria ser mensurável antes de
        acontecer.
      </p>
    </div>
  );
}

function Projecao() {
  const passos = [
    {
      n: '01',
      titulo: 'Audiência real, não seguidores',
      texto:
        'O motor parte do alcance médio observado nos últimos 30 dias por plataforma. Quando não há histórico, cai num índice de referência por plataforma em vez de assumir que todo seguidor vê o post.',
    },
    {
      n: '02',
      titulo: 'Engajamento ponderado',
      texto:
        'Média simples entre perfis mente: 5 mil seguidores com 12% não compensam 800 mil com 1,2%. A projeção pondera cada audiência pelo tamanho dela.',
    },
    {
      n: '03',
      titulo: 'Da interação à venda',
      texto:
        'Sobre o engajamento projetado aplica-se a taxa de conversão do segmento, o ticket médio informado pela marca e a margem de contribuição — nunca receita bruta, que infla o retorno.',
    },
    {
      n: '04',
      titulo: 'Retorno com as premissas à vista',
      texto:
        'O resultado é ROI sobre margem, com a versão do motor e todas as premissas impressas junto. Se a marca discorda do ticket médio, muda o número e vê a conta inteira se mexer.',
    },
  ];

  return (
    <div>
      <p className="text-sm leading-relaxed text-ink-muted md:text-[15px]">
        A projeção não é uma estimativa de marketing: é uma conta com etapas
        auditáveis, e cada uma delas pode ser contestada na negociação.
      </p>

      <ol className="mt-5 space-y-3">
        {passos.map((passo) => (
          <li
            key={passo.n}
            className="border-(length:--border-width) border-line px-4 py-3.5"
            style={{ borderRadius: 'calc(var(--radius) - 6px)' }}
          >
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-xs text-ink-muted">{passo.n}</span>
              <h3 className="text-sm font-medium">{passo.titulo}</h3>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{passo.texto}</p>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs text-ink-muted">
        A calculadora da home roda exatamente este motor — é o mesmo cálculo que aparece
        na proposta enviada à marca.
      </p>
    </div>
  );
}

function Garantias() {
  const agora = [
    'Pagamento retido em custódia até a marca aprovar a entrega.',
    'Identidade e posse das contas conferidas antes do selo de verificado.',
    'Escopo, prazo e uso de imagem registrados a cada campanha.',
    'Métricas lidas na plataforma, não enviadas por print.',
  ];

  const proximas = [
    {
      titulo: 'Mediação de disputa',
      texto:
        'Um rito claro para quando marca e criador discordam da entrega, com prazo definido e parecer registrado — hoje isso vira conversa por mensagem.',
    },
    {
      titulo: 'Antecipação de recebível',
      texto:
        'Permitir que o criador receba antes do fim do ciclo da campanha, com taxa transparente, sem depender do calendário financeiro da marca.',
    },
    {
      titulo: 'Auditoria independente de alcance',
      texto:
        'Conferência de métricas por terceiro para campanhas acima de um determinado valor, encerrando a discussão sobre audiência inflada.',
    },
    {
      titulo: 'Selo de conformidade publicitária',
      texto:
        'Verificação automática de sinalização de publicidade conforme as regras do CONAR, protegendo os dois lados de autuação.',
    },
  ];

  return (
    <div>
      <h3 className="text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">
        Em vigor hoje
      </h3>
      <ul className="mt-3 space-y-2">
        {agora.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
            <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-7 text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">
        No caminho
      </h3>
      <p className="mt-2 text-xs text-ink-muted">
        Compromissos que ainda não valem — listados aqui porque prometer garantia que
        não existe é o oposto do que a plataforma defende.
      </p>
      <ul className="mt-3 space-y-3">
        {proximas.map((item) => (
          <li
            key={item.titulo}
            className="border-(length:--border-width) border-line px-4 py-3.5"
            style={{ borderRadius: 'calc(var(--radius) - 6px)' }}
          >
            <h4 className="text-sm font-medium">{item.titulo}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.texto}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
