import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BrandId, CreatorId } from '@/domain';
import { findAccountByEmail } from '@/application/auth/demoAccounts';

export type SessionRole = 'creator' | 'brand' | 'guest';

export interface Session {
  readonly role: SessionRole;
  readonly displayName: string;
  readonly email: string | null;
  readonly creatorId: CreatorId | null;
  readonly brandId: BrandId | null;
}

const GUEST_SESSION: Session = {
  role: 'guest',
  displayName: 'Visitante',
  email: null,
  creatorId: null,
  brandId: null,
};

interface AuthState {
  readonly session: Session;
  readonly isAuthenticated: boolean;
  /**
   * `false` até o localStorage ser lido.
   *
   * Sem isto, o primeiro render sempre vê `guest` e um gate ingênuo expulsa
   * quem está legitimamente logado no F5. Toda decisão de acesso precisa
   * esperar esta flag.
   */
  readonly isHydrated: boolean;
  readonly signInWithEmail: (email: string) => boolean;
  readonly signOut: () => void;
  readonly markHydrated: () => void;
}

/**
 * ATENÇÃO — escopo desta store.
 *
 * Isto é estado de SESSÃO NO CLIENT: serve para a UI saber o que renderizar.
 * NÃO é controle de acesso. Qualquer dado real ou ação com efeito precisa ser
 * autorizada no servidor, que revalida a identidade por conta própria.
 * Esconder um botão aqui é UX, nunca segurança.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: GUEST_SESSION,
      isAuthenticated: false,
      isHydrated: false,

      signInWithEmail: (email) => {
        const account = findAccountByEmail(email);
        if (!account) return false;

        set({
          session: {
            role: account.role,
            displayName: account.displayName,
            email: account.email,
            creatorId: account.creatorId,
            brandId: account.brandId,
          },
          isAuthenticated: true,
        });
        return true;
      },

      signOut: () => set({ session: GUEST_SESSION, isAuthenticated: false }),

      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: '1mp.session',
      // `isHydrated` fica FORA do storage: é estado de runtime, e persistir
      // `true` faria a próxima sessão nascer achando que já leu o disco.
      partialize: ({ session, isAuthenticated }) => ({ session, isAuthenticated }),

      // Roda depois da leitura do storage, com ou sem dado salvo — é o que
      // libera os gates para decidir.
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
