import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAccentStore } from './useAccentStore';

export type ThemeName = 'brutalist' | 'midnight';

interface ThemeState {
  readonly theme: ThemeName;
  readonly setTheme: (theme: ThemeName) => void;
  readonly toggleTheme: () => void;
}

/**
 * Aplica o tema no <html> como data-attribute.
 *
 * Data-attribute em vez de classe porque os dois temas não são "claro/escuro" do
 * mesmo design — são sistemas visuais distintos (Neo-Brutalist vs Midnight & Gold),
 * cada um com seu conjunto completo de tokens em globals.css.
 */
const applyTheme = (theme: ThemeName): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;

  // O destaque escolhido tem um par de cores por tema; sem reaplicar aqui, o
  // override inline continuaria com a cor do tema anterior.
  useAccentStore.getState().reapply();
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'brutalist',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next: ThemeName = get().theme === 'brutalist' ? 'midnight' : 'brutalist';
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: '1mp.theme',
      onRehydrateStorage: () => (state) => {
        // Reaplica no DOM depois da hidratação, senão o valor persistido fica
        // só no estado do React e o CSS continua no tema padrão.
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
