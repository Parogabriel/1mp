import type { ReactNode } from 'react';

export type BadgeTone = 'accent' | 'signal' | 'violet' | 'lime' | 'amber';

const TONE_BG: Readonly<Record<BadgeTone, string>> = {
  accent: 'var(--accent)',
  signal: 'var(--signal)',
  violet: 'var(--violet)',
  lime: 'var(--lime)',
  amber: 'var(--amber)',
};

/** Lima e âmbar são claros nos dois temas — texto escuro sempre, não branco. */
const TONE_TEXT: Readonly<Record<BadgeTone, string>> = {
  accent: 'var(--accent-ink)',
  signal: '#ffffff',
  violet: '#ffffff',
  lime: '#0b0f17',
  amber: '#1a1024',
};

interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly children: ReactNode;
}

export function Badge({ tone = 'accent', children }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-widest whitespace-nowrap uppercase"
      style={{
        background: TONE_BG[tone],
        color: TONE_TEXT[tone],
        borderRadius: 'var(--radius-pill)',
      }}
    >
      {children}
    </span>
  );
}
