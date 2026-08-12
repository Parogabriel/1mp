import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentName = 'padrao' | 'violeta' | 'ambar' | 'coral' | 'oceano';

interface AccentPreset {
  readonly label: string;
  /** Cor do destaque em cada tema. `null` devolve o valor original do tema. */
  readonly light: { accent: string; ink: string } | null;
  readonly dark: { accent: string; ink: string } | null;
}

/**
 * `--accent` é a cor de AÇÃO — botão primário, número em destaque, barra de
 * progresso. O par accent/ink anda junto de propósito: trocar só o fundo
 * produziria texto ilegível em cima.
 */
export const ACCENT_PRESETS: Readonly<Record<AccentName, AccentPreset>> = {
  padrao: { label: 'Padrão do tema', light: null, dark: null },
  violeta: {
    label: 'Violeta',
    light: { accent: '#6366f1', ink: '#ffffff' },
    dark: { accent: '#8b5cf6', ink: '#ffffff' },
  },
  ambar: {
    label: 'Âmbar',
    light: { accent: '#d97706', ink: '#ffffff' },
    dark: { accent: '#f59e0b', ink: '#1a1024' },
  },
  coral: {
    label: 'Coral',
    light: { accent: '#e11d48', ink: '#ffffff' },
    dark: { accent: '#ff6b6b', ink: '#1a1024' },
  },
  oceano: {
    label: 'Oceano',
    light: { accent: '#0891b2', ink: '#ffffff' },
    dark: { accent: '#22d3ee', ink: '#0b0f17' },
  },
};

/**
 * Escreve o override no <html>.
 *
 * Estilo inline vence os seletores de tema do globals.css sem precisar de
 * `!important`. `removeProperty` devolve o controle ao tema — por isso o preset
 * "padrão" não tem cor própria.
 */
const applyAccent = (name: AccentName): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const isDark = root.dataset.theme === 'midnight';
  const preset = ACCENT_PRESETS[name];
  const pair = isDark ? preset.dark : preset.light;

  if (!pair) {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-ink');
    return;
  }

  root.style.setProperty('--accent', pair.accent);
  root.style.setProperty('--accent-ink', pair.ink);
};

interface AccentState {
  readonly accent: AccentName;
  readonly setAccent: (accent: AccentName) => void;
  /** Reaplica com o tema atual — chamado ao trocar claro/escuro. */
  readonly reapply: () => void;
}

export const useAccentStore = create<AccentState>()(
  persist(
    (set, get) => ({
      accent: 'padrao',
      setAccent: (accent) => {
        applyAccent(accent);
        set({ accent });
      },
      reapply: () => applyAccent(get().accent),
    }),
    {
      name: '1mp.accent',
      partialize: ({ accent }) => ({ accent }),
      onRehydrateStorage: () => (state) => {
        // Sem isto o valor salvo fica só no estado do React e o CSS continua
        // no destaque padrão — mesmo cuidado que useThemeStore já toma.
        if (state) applyAccent(state.accent);
      },
    },
  ),
);
