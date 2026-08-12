/**
 * Atributos comuns das quatro ilustrações da home.
 *
 * `currentColor` em vez de cor fixa: a ilustração herda a tinta do texto ao
 * redor, então funciona nos dois temas sem uma segunda versão. As cores de
 * acento entram só nos preenchimentos, que são pontuação — o desenho tem que
 * continuar legível se todas elas sumirem.
 */
export const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Traço de destaque: mesma família, um pouco mais grosso e colorido. */
export const ACCENT_LINE = {
  ...LINE,
  stroke: 'var(--accent)',
  strokeWidth: 2.8,
} as const;

/**
 * Props que toda ilustração aceita.
 *
 * São acento decorativo: o texto da seção já diz tudo o que elas ilustram, então
 * saem da árvore de acessibilidade em vez de virarem `alt` redundante.
 */
export interface IllustrationProps {
  readonly className?: string;
}

export const DECORATIVE = {
  'aria-hidden': true,
  focusable: false,
  xmlns: 'http://www.w3.org/2000/svg',
} as const;
