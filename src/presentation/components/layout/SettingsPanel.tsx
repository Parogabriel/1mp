'use client';

import { ACCENT_PRESETS, useAccentStore, type AccentName } from '@/application/stores/useAccentStore';
import { useThemeStore, type ThemeName } from '@/application/stores/useThemeStore';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { Modal } from '@/presentation/components/ui/Modal';

const THEMES: ReadonlyArray<{ id: ThemeName; label: string; hint: string }> = [
  { id: 'brutalist', label: 'Claro', hint: 'Fundo claro, tinta escura' },
  { id: 'midnight', label: 'Escuro', hint: 'Obsidian com brilho difuso' },
];

const ACCENT_ORDER: readonly AccentName[] = ['padrao', 'violeta', 'ambar', 'coral', 'oceano'];

interface SettingsPanelProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

/**
 * Aparência e sessão num lugar só.
 *
 * A troca de tema e de cor era decidida por um botão solto no cabeçalho; aqui
 * vira preferência explícita, com o efeito visível na hora — cada opção é
 * pintada com a própria cor que aplica.
 */
export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const accent = useAccentStore((s) => s.accent);
  const setAccent = useAccentStore((s) => s.setAccent);
  const session = useAuthStore((s) => s.session);

  return (
    <Modal open={open} onClose={onClose} eyebrow="Preferências" title="Configurações">
      <section aria-labelledby="cfg-tema">
        <h3 id="cfg-tema" className="text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">
          Tema
        </h3>
        <div role="radiogroup" aria-labelledby="cfg-tema" className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {THEMES.map((option) => {
            const selected = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(option.id)}
                className="rounded-card border-(length:--border-width) px-4 py-3 text-left transition-colors duration-200"
                style={{
                  borderColor: selected ? 'var(--accent)' : 'var(--line)',
                  background: selected
                    ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                    : 'transparent',
                }}
              >
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="cfg-cor" className="mt-8">
        <h3 id="cfg-cor" className="text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">
          Cor de destaque
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
          Vale para botões principais, números em destaque e barras de progresso. Cada
          opção tem um par de tons — um para o tema claro, outro para o escuro.
        </p>

        <div role="radiogroup" aria-labelledby="cfg-cor" className="mt-3 flex flex-wrap gap-2">
          {ACCENT_ORDER.map((name) => {
            const preset = ACCENT_PRESETS[name];
            const selected = accent === name;
            const pair = theme === 'midnight' ? preset.dark : preset.light;

            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setAccent(name)}
                className="flex items-center gap-2 rounded-full border-(length:--border-width) px-3.5 py-2 text-xs transition-colors duration-200"
                style={{
                  borderColor: selected ? 'var(--accent)' : 'var(--line)',
                  background: selected
                    ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                    : 'transparent',
                }}
              >
                <span
                  aria-hidden="true"
                  className="size-3.5 rounded-full border-(length:--border-width) border-line"
                  // O "padrão" mostra a cor viva do tema, não um vazio.
                  style={{ background: pair?.accent ?? 'var(--accent)' }}
                />
                {preset.label}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="cfg-sessao" className="mt-8">
        <h3
          id="cfg-sessao"
          className="text-xs font-medium tracking-[0.2em] text-ink-muted uppercase"
        >
          Sessão
        </h3>
        <dl className="rounded-card mt-3 border-(length:--border-width) border-line px-4 py-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Perfil</dt>
            <dd className="font-medium">{session.displayName}</dd>
          </div>
          {session.email && (
            <div className="mt-2 flex justify-between gap-4">
              <dt className="text-ink-muted">Email</dt>
              <dd className="truncate tabular-nums text-xs">{session.email}</dd>
            </div>
          )}
          <div className="mt-2 flex justify-between gap-4">
            <dt className="text-ink-muted">Papel</dt>
            <dd className="font-medium">
              {session.role === 'creator' ? 'Criador' : session.role === 'brand' ? 'Marca' : 'Visitante'}
            </dd>
          </div>
        </dl>
      </section>
    </Modal>
  );
}
