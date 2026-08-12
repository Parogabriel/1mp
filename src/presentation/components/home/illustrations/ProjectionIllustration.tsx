import { ACCENT_LINE, DECORATIVE, LINE, type IllustrationProps } from './strokes';

/**
 * O briefing de onde sai uma curva que escapa da folha.
 *
 * A curva atravessa a borda do documento de propósito: a projeção não é mais um
 * campo do formulário, é o que o formulário produz.
 */
export function ProjectionIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 180" className={className} {...DECORATIVE}>
      <ellipse cx="96" cy="164" rx="72" ry="9" fill="var(--violet)" opacity="0.12" />

      {/* O briefing */}
      <rect
        x="26"
        y="30"
        width="118"
        height="126"
        rx="14"
        {...LINE}
        fill="var(--surface-raised)"
      />
      <rect x="44" y="52" width="58" height="6" rx="3" fill="currentColor" opacity="0.28" />
      <rect x="44" y="68" width="80" height="5" rx="2.5" fill="currentColor" opacity="0.15" />
      <rect x="44" y="82" width="46" height="5" rx="2.5" fill="currentColor" opacity="0.15" />

      <rect x="44" y="118" width="12" height="22" rx="4" fill="var(--violet)" opacity="0.35" />
      <rect x="62" y="106" width="12" height="34" rx="4" fill="var(--violet)" opacity="0.6" />
      <rect x="80" y="126" width="12" height="14" rx="4" fill="var(--violet)" opacity="0.35" />

      {/* A curva projetada, saindo da folha */}
      <path
        d="M62 138C104 136 126 110 148 86S196 46 214 34"
        {...ACCENT_LINE}
      />
      <path d="M205 47 214 34 198 33" {...ACCENT_LINE} />

      <circle cx="148" cy="86" r="5.5" fill="var(--accent)" />
      <circle cx="182" cy="56" r="4" fill="var(--accent)" opacity="0.6" />

      {/* Premissa à vista: a etiqueta pendurada no ponto medido. */}
      <path d="M148 86 168 106" {...LINE} strokeDasharray="1 7" opacity="0.5" />
      <rect
        x="164"
        y="106"
        width="52"
        height="26"
        rx="8"
        {...LINE}
        fill="var(--surface-raised)"
      />
      <rect x="174" y="115" width="24" height="5" rx="2.5" fill="currentColor" opacity="0.3" />
      <rect x="174" y="123" width="14" height="4" rx="2" fill="currentColor" opacity="0.16" />
    </svg>
  );
}
