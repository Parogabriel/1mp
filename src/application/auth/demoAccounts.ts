import { asBrandId, asCreatorId, type BrandId, type CreatorId } from '@/domain';

/**
 * ⚠️ CONTAS DE DEMONSTRAÇÃO — NÃO É AUTENTICAÇÃO
 *
 * Esta lista está no bundle do client e qualquer um edita o localStorage. Serve
 * para a UI saber qual painel renderizar, nada além disso. Não há senha de
 * propósito: senha falsa só criaria a impressão de proteção que não existe.
 *
 * Com dado real, a identidade passa a ser resolvida no servidor a cada
 * requisição.
 */

export type AccountRole = 'creator' | 'brand';

export interface DemoAccount {
  readonly email: string;
  readonly role: AccountRole;
  readonly displayName: string;
  /** Preenchido só quando `role === 'creator'`. */
  readonly creatorId: CreatorId | null;
  /** Preenchido só quando `role === 'brand'`. */
  readonly brandId: BrandId | null;
  /** Cargo/contexto mostrado no card da tela de entrada. */
  readonly subtitle: string;
}

/** Os ids apontam para os registros semeados em useWorkspaceStore. */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: 'lais@1mp.com.br',
    role: 'creator',
    displayName: 'Laís Mattos',
    creatorId: asCreatorId('creator-lais'),
    brandId: null,
    subtitle: 'Beleza e lifestyle · 550 mil seguidores',
  },
  {
    email: 'pedro@1mp.com.br',
    role: 'creator',
    displayName: 'Pedro Corrêa',
    creatorId: asCreatorId('creator-pedro'),
    brandId: null,
    subtitle: 'Tech e games · 128 mil seguidores',
  },
  {
    email: 'bruna@1mp.com.br',
    role: 'creator',
    displayName: 'Bruna Nutri',
    creatorId: asCreatorId('creator-bruna'),
    brandId: null,
    subtitle: 'Fitness e alimentação · 58 mil seguidores',
  },
  {
    email: 'contato@vervo.com.br',
    role: 'brand',
    displayName: 'Vervo',
    creatorId: null,
    brandId: asBrandId('brand-vervo'),
    subtitle: 'Cosméticos · gestão de campanhas',
  },
  {
    email: 'marketing@kaza.com.br',
    role: 'brand',
    displayName: 'Kaza',
    creatorId: null,
    brandId: asBrandId('brand-kaza'),
    subtitle: 'Casa e decoração · gestão de campanhas',
  },
];

/** Busca sem diferenciar maiúsculas nem espaço em volta. */
export function findAccountByEmail(email: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((account) => account.email === normalized);
}
