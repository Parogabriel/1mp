import type { ReactNode } from 'react';

interface ProductFrameProps {
  /** Diz qual tela do produto está enquadrada. Vira a "aba" da janela. */
  readonly label: string;
  /** Canto direito da barra: convite curto ("arraste um card") ou ressalva. */
  readonly hint?: string;
  readonly children: ReactNode;
  /** `none` para conteúdo que já traz o próprio respiro (tabela, board). */
  readonly padding?: 'none' | 'md' | 'lg';
  readonly className?: string;
}

const PADDINGS: Readonly<Record<NonNullable<ProductFrameProps['padding']>, string>> = {
  none: '',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-7',
};

/**
 * Moldura de janela em volta de um componente **real** do produto.
 *
 * Não é captura de tela de propósito: print envelhece na primeira mudança de
 * layout e passa a mentir sobre o que a aplicação faz. Aqui a home monta o mesmo
 * componente que o painel monta, lendo a mesma store — mudou a tela, mudou a
 * home junto, sem ninguém lembrar de trocar imagem.
 *
 * A barra superior existe para separar "isto é o produto" de "isto é mais um
 * card da página". Os pontos são enfeite e saem da árvore de acessibilidade; o
 * rótulo não — é a legenda do que está enquadrado.
 */
export function ProductFrame({
  label,
  hint,
  children,
  padding = 'md',
  className = '',
}: ProductFrameProps) {
  return (
    <figure
      className={`rounded-card overflow-hidden border-(length:--border-width) border-line bg-surface-raised shadow-lift ${className}`}
    >
      <figcaption
        className="flex items-center gap-3 border-b-(length:--border-width) border-line px-4 py-2.5"
        style={{ background: 'color-mix(in srgb, var(--ink) 3%, transparent)' }}
      >
        <span aria-hidden="true" className="flex shrink-0 gap-1.5">
          <Dot color="var(--signal)" />
          <Dot color="var(--amber)" />
          <Dot color="var(--accent)" />
        </span>

        <span className="truncate text-xs font-medium">{label}</span>

        {hint && (
          <span className="ml-auto hidden shrink-0 text-[11px] tracking-widest text-ink-muted uppercase sm:block">
            {hint}
          </span>
        )}
      </figcaption>

      <div className={PADDINGS[padding]}>{children}</div>
    </figure>
  );
}

function Dot({ color }: { readonly color: string }) {
  return <span className="size-2 rounded-full" style={{ background: color, opacity: 0.75 }} />;
}
