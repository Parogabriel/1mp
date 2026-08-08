'use client';

import { useId } from 'react';

interface BrandSealProps {
  readonly size?: number;
  readonly className?: string;
}

/**
 * Selo circular da marca — globo + nome em arco, no mesmo vocabulário de
 * linha fina dos ícones do TrustFooter (stroke, sem preenchimento pesado).
 *
 * Adaptação da referência em colagem punk (papel rasgado, globo em meio-tom,
 * tipografia distressed): mantém a estrutura — círculo, globo ao centro,
 * nome em arco, brilho de canto — mas em vetor limpo, sem textura raster e
 * sem fundo xadrez. `currentColor`/CSS var em tudo, então tema junto com a
 * página sem lógica extra.
 */
export function BrandSeal({ size = 96, className }: BrandSealProps) {
  // Ids únicos por instância: dois selos na mesma página não podem
  // compartilhar <path> de guia do textPath.
  const reactId = useId().replace(/:/g, '');
  const topArcId = `seal-top-${reactId}`;
  const bottomArcId = `seal-bottom-${reactId}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* Anel externo — substitui a borda de papel rasgado por uma linha só. */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="var(--ink)" strokeWidth="1" />

      {/* Guias do arco de texto, invisíveis — só direcionam o textPath. */}
      <path id={topArcId} d="M 14.3 37 A 38 38 0 0 1 85.7 37" fill="none" />
      <path id={bottomArcId} d="M 14.3 63 A 38 38 0 0 0 85.7 63" fill="none" />

      <text
        fontFamily="var(--font-display)"
        fontSize="9"
        letterSpacing="1.5"
        fill="var(--ink)"
      >
        <textPath href={`#${topArcId}`} startOffset="50%" textAnchor="middle">
          ONE MILLION
        </textPath>
      </text>
      <text
        fontFamily="var(--font-display)"
        fontSize="9"
        letterSpacing="2.5"
        fill="var(--ink)"
      >
        <textPath href={`#${bottomArcId}`} startOffset="50%" textAnchor="middle">
          POSTS
        </textPath>
      </text>

      {/* Globo: círculo + linha do equador + lente central sugerindo o
          meridiano — o mesmo desenho por trás de qualquer ícone de "globo"
          minimalista, só que sem o halftone raster do original. */}
      <circle cx="50" cy="50" r="28" fill="none" stroke="var(--ink)" strokeWidth="1.4" />
      <line x1="22" y1="50" x2="78" y2="50" stroke="var(--ink)" strokeWidth="1.4" />
      <path
        d="M50 22 A42.8 42.8 0 0 1 61.2 50 A42.8 42.8 0 0 1 50 78 A42.8 42.8 0 0 1 38.8 50 A42.8 42.8 0 0 1 50 22 Z"
        fill="none"
        stroke="var(--violet)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Acento — a única sobra do brilho do original, fixo no desenho do
          selo. Não é motivo repetido de fundo (esse padrão já foi retirado
          do AmbientBackdrop por ficar "tecnológico demais"). */}
      <path
        d="M85.2 74.6 L86.19 78.61 L90.2 79.6 L86.19 80.59 L85.2 84.6 L84.21 80.59 L80.2 79.6 L84.21 78.61 Z"
        fill="var(--violet)"
      />
    </svg>
  );
}
