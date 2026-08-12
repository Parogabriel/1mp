interface WordBandProps {
  readonly word: string;
}

/**
 * Faixa de respiro entre seções: uma palavra grande, e só.
 *
 * Substituiu um rolodex de scroll de 169 linhas. Ele animava uma lista de
 * palavras em degraus — mas as três chamadas da home passavam **uma** palavra, e
 * com uma palavra a rampa nunca sai do lugar. O que sobrava era 62vh de rolagem
 * vazia por faixa, três vezes, para exibir texto estático.
 */
export function WordBand({ word }: WordBandProps) {
  return (
    <section aria-hidden="true" className="overflow-hidden px-6 py-10">
      <p className="font-display mx-auto max-w-6xl text-[7vw] leading-[0.9] font-bold tracking-tighter uppercase">
        {word}
      </p>
    </section>
  );
}
