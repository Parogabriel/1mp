import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BrandId, CreatorId } from '@/domain';

export type SessionRole = 'creator' | 'brand' | 'guest';

export interface Session {
  readonly role: SessionRole;
  readonly displayName: string;
  readonly creatorId: CreatorId | null;
  readonly brandId: BrandId | null;
}

const GUEST_SESSION: Session = {
  role: 'guest',
  displayName: 'Visitante',
  creatorId: null,
  brandId: null,
};

interface AuthState {
  readonly session: Session;
  readonly isAuthenticated: boolean;
  readonly signIn: (session: Session) => void;
  readonly signOut: () => void;
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
      signIn: (session) => set({ session, isAuthenticated: session.role !== 'guest' }),
      signOut: () => set({ session: GUEST_SESSION, isAuthenticated: false }),
    }),
    { name: '1mp.session' },
  ),
);
