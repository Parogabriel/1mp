import { ACCENT_LINE, DECORATIVE, LINE, type IllustrationProps } from './strokes';

/**
 * O valor trancado sobre uma concha aberta.
 *
 * Custódia é uma ideia chata de desenhar: cofre parece burocracia e cifrão
 * parece taxa. A moeda travada e apoiada — nem guardada, nem entregue — é o
 * estado exato em que o dinheiro fica entre o aceite e a entrega.
 */
export function EscrowIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 180" className={className} {...DECORATIVE}>
      <ellipse cx="120" cy="162" rx="80" ry="10" fill="var(--amber)" opacity="0.14" />

      {/* Moeda */}
      <circle
        cx="120"
        cy="74"
        r="40"
        {...LINE}
        fill="color-mix(in srgb, var(--amber) 20%, transparent)"
      />
      <circle cx="120" cy="74" r="30" {...LINE} opacity="0.45" strokeDasharray="3 6" />

      {/* Cadeado */}
      <path d="M109 74v-9a11 11 0 0 1 22 0v9" {...LINE} />
      <rect
        x="105"
        y="74"
        width="30"
        height="25"
        rx="7"
        {...LINE}
        fill="var(--surface-raised)"
      />
      <circle cx="120" cy="84" r="3.2" fill="currentColor" />
      <path d="M120 87v5" {...LINE} />

      {/* A concha que sustenta — aberta, não fechada. */}
      <path d="M52 112c14 28 38 42 68 42s54-14 68-42" {...ACCENT_LINE} />
      <path d="M48 98 55 112" {...LINE} opacity="0.4" />
      <path d="M192 98 185 112" {...LINE} opacity="0.4" />

      {/* Liberação: o passo seguinte, indicado sem acontecer ainda. */}
      <path d="M206 128 218 140 206 152" {...LINE} opacity="0.35" />
    </svg>
  );
}
