interface MarqueeProps {
  readonly items: readonly string[];
  readonly tone?: 'accent' | 'surface';
  readonly className?: string;
}

/**
 * Ticker horizontal infinito.
 *
 * `aria-hidden`: a lista se repete duas vezes pra animação de loop nunca
 * mostrar um vazio na emenda — narrar isso pra leitor de tela seria ruído
 * duplicado de uma informação decorativa, não dado novo. Quem usa teclado
 * ou leitor de tela não perde nada pulando esta faixa.
 */
export function Marquee({ items, tone = 'accent', className = '' }: MarqueeProps) {
  const track = [...items, ...items];

  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden border-y-(length:--border-width) border-line py-3 ${className}`}
      style={{
        background: tone === 'accent' ? 'var(--accent)' : 'var(--surface-raised)',
      }}
    >
      <div className="marquee-track flex w-max items-center gap-8">
        {track.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 text-xs font-bold tracking-widest whitespace-nowrap uppercase"
            style={{ color: tone === 'accent' ? 'var(--accent-ink)' : 'var(--ink)' }}
          >
            {item}
            <span aria-hidden="true" style={{ color: 'var(--signal)' }}>
              ●
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
