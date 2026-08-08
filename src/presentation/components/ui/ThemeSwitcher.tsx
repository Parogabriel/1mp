'use client';

import { useThemeStore, type ThemeName } from '@/application/stores/useThemeStore';

const OPTIONS: ReadonlyArray<{ value: ThemeName; label: string }> = [
  { value: 'brutalist', label: 'Claro' },
  { value: 'midnight', label: 'Escuro' },
];

/**
 * Radiogroup em vez de toggle: com dois temas nomeados (não "on/off"), o usuário
 * precisa ver qual está ativo. Setas do teclado navegam entre as opções — é o
 * comportamento que um leitor de tela anuncia para role="radiogroup".
 */
export function ThemeSwitcher() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div
      role="radiogroup"
      aria-label="Tema da interface"
      className="inline-flex border-(length:--border-width) border-line bg-surface-raised p-1"
      style={{ borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-hard-sm)' }}
    >
      {OPTIONS.map(({ value, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors"
            style={{
              borderRadius: 'var(--radius-pill)',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--accent-ink)' : 'var(--ink-muted)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
