import { ACCENT_LINE, DECORATIVE, LINE, type IllustrationProps } from './strokes';

/**
 * Duas pessoas olhando para o mesmo painel de números.
 *
 * É o argumento inteiro da seção em uma imagem: não há uma versão "de venda" e
 * uma versão "real" — os dois lados leem a mesma tela, ao mesmo tempo.
 */
export function SharedNumberIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 180" className={className} {...DECORATIVE}>
      {/* Chão: sombra suave que assenta a cena em vez de deixá-la boiando. */}
      <ellipse cx="120" cy="152" rx="94" ry="11" fill="var(--accent)" opacity="0.12" />

      {/* Marca — lado esquerdo */}
      <circle cx="40" cy="60" r="15" {...LINE} />
      <path d="M14 130c0-17 12-30 26-30s26 13 26 30" {...LINE} />

      {/* Criador — lado direito */}
      <circle cx="200" cy="60" r="15" {...LINE} />
      <path d="M174 130c0-17 12-30 26-30s26 13 26 30" {...LINE} />

      {/* Linhas de olhar: tracejadas porque são atenção, não objeto. */}
      <path d="M57 66 78 76" {...LINE} strokeDasharray="1 7" opacity="0.45" />
      <path d="M183 66 162 76" {...LINE} strokeDasharray="1 7" opacity="0.45" />

      {/* O painel compartilhado */}
      <rect
        x="80"
        y="36"
        width="80"
        height="98"
        rx="13"
        {...LINE}
        fill="var(--surface-raised)"
      />
      <rect x="93" y="52" width="38" height="6" rx="3" fill="currentColor" opacity="0.28" />
      <rect x="93" y="65" width="24" height="5" rx="2.5" fill="currentColor" opacity="0.16" />

      <rect x="93" y="98" width="11" height="20" rx="4" fill="var(--violet)" opacity="0.45" />
      <rect x="109" y="84" width="11" height="34" rx="4" fill="var(--accent)" opacity="0.85" />
      <rect x="125" y="92" width="11" height="26" rx="4" fill="var(--violet)" opacity="0.45" />
      <rect x="141" y="76" width="11" height="42" rx="4" fill="var(--accent)" opacity="0.55" />

      {/* A mesma linha de leitura para os dois — a base dos gráficos. */}
      <path d="M90 122h60" {...ACCENT_LINE} strokeWidth="2.2" opacity="0.55" />
    </svg>
  );
}
