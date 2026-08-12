import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Rate, fromPercent } from '@/domain';

/**
 * ⚠️ NÃO É SEGREDO. O passcode vai no bundle do client e é legível no DevTools.
 *
 * Aceitável só porque o escopo desta tela é popular dados locais de
 * demonstração. No dia em que o God Mode tocar dado real, ele vira autenticação
 * de servidor com role de administrador — não há meia-medida.
 */
const DEMO_PASSCODE = '1MP-GOD-2026' as const;

/** Sequência de teclas que revela a rota secreta. */
export const GOD_MODE_SHORTCUT = ['g', 'o', 'd'] as const;

export interface FeatureFlags {
  readonly maintenanceMode: boolean;
  readonly liveTicker: boolean;
  readonly roiCalculator: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  maintenanceMode: false,
  liveTicker: true,
  roiCalculator: true,
};

/** Taxa padrão da plataforma sobre cada campanha fechada. */
const DEFAULT_PLATFORM_FEE = fromPercent(12);

interface GodModeState {
  readonly isUnlocked: boolean;
  readonly flags: FeatureFlags;
  readonly platformFee: Rate;
  readonly lastSeedAt: Date | null;
  readonly unlock: (passcode: string) => boolean;
  readonly lock: () => void;
  readonly toggleFlag: (flag: keyof FeatureFlags) => void;
  readonly setPlatformFee: (fee: Rate) => void;
  readonly markSeeded: () => void;
  readonly resetFlags: () => void;
}

export const useGodModeStore = create<GodModeState>()(
  persist(
    (set, get) => ({
      isUnlocked: false,
      flags: DEFAULT_FLAGS,
      platformFee: DEFAULT_PLATFORM_FEE,
      lastSeedAt: null,

      unlock: (passcode) => {
        const ok = passcode.trim() === DEMO_PASSCODE;
        if (ok) set({ isUnlocked: true });
        return ok;
      },

      lock: () => set({ isUnlocked: false }),

      toggleFlag: (flag) =>
        set({ flags: { ...get().flags, [flag]: !get().flags[flag] } }),

      setPlatformFee: (platformFee) => set({ platformFee }),

      markSeeded: () => set({ lastSeedAt: new Date() }),

      resetFlags: () =>
        set({ flags: DEFAULT_FLAGS, platformFee: DEFAULT_PLATFORM_FEE }),
    }),
    {
      name: '1mp.godmode',
      // isUnlocked fica FORA do storage de propósito: cada sessão nova exige o
      // passcode de novo, em vez de deixar a porta destrancada indefinidamente.
      partialize: ({ flags, platformFee, lastSeedAt }) => ({
        flags,
        platformFee,
        lastSeedAt,
      }),

      // O parse devolve string onde o tipo promete `Date`. Sem reviver,
      // `Intl.format(lastSeedAt)` estoura RangeError depois de um reload.
      merge: (persisted, current) => {
        const stored = persisted as Partial<Record<keyof GodModeState, unknown>> | undefined;
        const rawSeedAt = stored?.lastSeedAt;
        return {
          ...current,
          ...(stored as Partial<GodModeState>),
          lastSeedAt: typeof rawSeedAt === 'string' ? new Date(rawSeedAt) : null,
        };
      },
    },
  ),
);
