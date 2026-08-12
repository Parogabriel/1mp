import { DECORATIVE, LINE, type IllustrationProps } from './strokes';

/** Os três marcos da trilha, do mais antigo ao que ainda está aberto. */
const MILESTONES = [
  { y: 44, done: true, width: 128 },
  { y: 92, done: true, width: 142 },
  { y: 140, done: false, width: 112 },
] as const;

/**
 * A campanha registrada passo a passo.
 *
 * O último marco fica vazado: o histórico é o que já aconteceu, e desenhar tudo
 * concluído sugeriria um registro fechado — que é justamente o contrário de uma
 * campanha em curso.
 */
export function TrailIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 180" className={className} {...DECORATIVE}>
      {/* Trilho */}
      <path d="M36 30v120" {...LINE} strokeDasharray="1 8" opacity="0.35" />

      {MILESTONES.map(({ y, done, width }) => (
        <g key={y}>
          <circle
            cx="36"
            cy={y}
            r="8"
            {...LINE}
            fill={done ? 'var(--accent)' : 'var(--surface-raised)'}
            stroke={done ? 'var(--accent)' : 'currentColor'}
          />
          {done && <path d="M32 44l3 3 5-6" {...LINE} stroke="var(--accent-ink)" strokeWidth="2" transform={`translate(0 ${y - 44})`} />}

          <rect
            x="60"
            y={y - 17}
            width={width}
            height="34"
            rx="11"
            {...LINE}
            fill="var(--surface-raised)"
          />
          <rect
            x="76"
            y={y - 9}
            width={width - 66}
            height="6"
            rx="3"
            fill="currentColor"
            opacity="0.24"
          />
          <rect
            x="76"
            y={y + 1}
            width={width - 96}
            height="5"
            rx="2.5"
            fill="currentColor"
            opacity="0.13"
          />
          <circle
            cx={60 + width - 20}
            cy={y}
            r="6"
            fill={done ? 'var(--accent)' : 'var(--amber)'}
            opacity={done ? 0.55 : 0.7}
          />
        </g>
      ))}
    </svg>
  );
}
