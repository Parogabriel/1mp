import { DEMO_BRAND_NAMES } from './demoBrands';

/**
 * Faixa de marcas do ambiente.
 *
 * Assinaturas tipográficas, não logotipos: um logo desenhado para uma empresa
 * que não existe vira falsificação de prova social no instante em que alguém
 * recorta a imagem. Assim a faixa cumpre o papel visual — a pausa horizontal
 * entre duas dobras densas — sem afirmar cliente que a plataforma não tem.
 *
 * São exatamente os nomes que o ticker e o seed já exibem: uma lista só, em
 * `demoBrands.ts`.
 */
export function BrandStrip() {
  return (
    <section
      aria-labelledby="marcas-heading"
      className="border-y-(length:--border-width) border-line"
      style={{ background: 'color-mix(in srgb, var(--ink) 2.5%, transparent)' }}
    >
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2
          id="marcas-heading"
          className="text-center text-[11px] tracking-[0.2em] text-ink-muted uppercase"
        >
          Marcas negociando neste ambiente
        </h2>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14">
          {DEMO_BRAND_NAMES.map((name) => (
            <li
              key={name}
              /* Sem `opacity`: ela desbota a tinta contra o fundo e o nome fica
                 ilegível. O recuo visual vem da cor de texto secundário, que já
                 é calibrada para contraste. */
              className="font-display text-lg font-normal tracking-tight text-ink-muted transition-colors duration-200 hover:text-ink sm:text-xl"
            >
              {name}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          Marcas fictícias deste ambiente de demonstração — nenhuma corresponde a empresa
          real.
        </p>
      </div>
    </section>
  );
}
