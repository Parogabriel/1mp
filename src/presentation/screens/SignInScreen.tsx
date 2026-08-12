'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEMO_ACCOUNTS, type DemoAccount } from '@/application/auth/demoAccounts';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { BrandSeal } from '@/presentation/components/ui/BrandSeal';
import { Card } from '@/presentation/components/ui/Card';
import { HandsNetworkCanvas } from '@/presentation/components/ui/HandsNetworkCanvas';
import { ThemeSwitcher } from '@/presentation/components/ui/ThemeSwitcher';
import { useToast } from '@/presentation/components/ui/Toast';

const DESTINATION: Readonly<Record<DemoAccount['role'], string>> = {
  creator: '/creator/dashboard',
  brand: '/brand/dashboard',
};

const PITCH = [
  'Projeção de alcance e retorno antes de assinar',
  'Métricas lidas na plataforma, não por print',
  'Pagamento retido em custódia até a entrega',
] as const;

/**
 * Entrada por conta de demonstração.
 *
 * Duas colunas: a esquerda sustenta a marca e o argumento, a direita resolve a
 * tarefa. Numa coluna só, o conteúdo ficava numa faixa estreita no meio de uma
 * tela larga e o fundo dominava.
 *
 * Sem senha de propósito: a lista está no bundle do client e qualquer senha
 * aqui seria teatro. A tela diz isso em voz alta em vez de fingir proteção.
 */
export function SignInScreen() {
  const router = useRouter();
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const toast = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const enter = (account: DemoAccount) => {
    setPending(account.email);
    const ok = signInWithEmail(account.email);
    if (!ok) {
      setPending(null);
      toast.show('Conta de demonstração não encontrada.', 'error');
      return;
    }
    toast.show(`Bem-vindo, ${account.displayName}.`, 'success');
    router.push(DESTINATION[account.role]);
  };

  const creators = DEMO_ACCOUNTS.filter((a) => a.role === 'creator');
  const brands = DEMO_ACCOUNTS.filter((a) => a.role === 'brand');

  return (
    <main className="relative min-h-screen lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* Painel de marca: a malha fica confinada aqui, longe do texto de leitura. */}
      <aside className="relative hidden overflow-hidden border-r-(length:--border-width) border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <HandsNetworkCanvas intensity={0.55} />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 30% 20%, color-mix(in srgb, var(--violet) 22%, transparent), transparent 70%)',
            }}
          />
        </div>

        <Link href="/" className="font-display text-base font-semibold tracking-tight">
          1MP<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>

        <div>
          <BrandSeal size={80} className="text-ink" />
          <h2 className="font-display mt-6 max-w-sm text-3xl leading-tight font-normal tracking-tight">
            Cada campanha nasce com número na mesa.
          </h2>
          <ul className="mt-7 space-y-3">
            {PITCH.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-ink-muted">
                <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-ink-muted">1MP — One Million Posts</p>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            href="/"
            className="font-display text-base font-semibold tracking-tight lg:invisible"
          >
            1MP<span style={{ color: 'var(--accent)' }}>.</span>
          </Link>
          <ThemeSwitcher />
        </header>

        <div className="mx-auto w-full max-w-lg flex-1 px-6 pb-16 sm:px-10">
          <h1 className="font-display text-3xl font-normal tracking-tight md:text-4xl">
            Entrar na plataforma
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Escolha um perfil para explorar. Cada conta abre apenas o painel do seu
            papel — criador vê o Creator Studio, marca vê o Brand Manager.
          </p>

          {/* O aviso é parte do produto, não rodapé escondido: quem demonstra
              precisa saber que isto não protege nada. */}
          <p
            role="note"
            className="rounded-card mt-5 border-(length:--border-width) border-line px-4 py-3 text-xs leading-relaxed text-ink-muted"
          >
            Ambiente de demonstração. Não há senha e os dados são fictícios — a escolha
            de perfil serve para mostrar as duas experiências, não para proteger
            informação.
          </p>

          <AccountGroup title="Criadores" accounts={creators} pending={pending} onEnter={enter} />
          <AccountGroup title="Marcas" accounts={brands} pending={pending} onEnter={enter} />
        </div>
      </div>
    </main>
  );
}

function AccountGroup({
  title,
  accounts,
  pending,
  onEnter,
}: {
  readonly title: string;
  readonly accounts: readonly DemoAccount[];
  readonly pending: string | null;
  readonly onEnter: (account: DemoAccount) => void;
}) {
  return (
    <section className="mt-8" aria-labelledby={`grupo-${title}`}>
      <h2
        id={`grupo-${title}`}
        className="text-xs font-medium tracking-[0.2em] text-ink-muted uppercase"
      >
        {title}
      </h2>

      <ul className="mt-3 space-y-2.5">
        {accounts.map((account) => (
          <Card
            as="li"
            key={account.email}
            padding="none"
            className="overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
          >
            <button
              type="button"
              onClick={() => onEnter(account)}
              disabled={pending !== null}
              className="group flex w-full items-center gap-3.5 px-5 py-4 text-left disabled:opacity-50"
            >
              <span
                aria-hidden="true"
                className="font-display flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{ background: 'var(--violet)', color: '#ffffff' }}
              >
                {account.displayName.charAt(0)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {account.displayName}
                </span>
                <span className="block truncate tabular-nums text-xs text-ink-muted">
                  {account.email}
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-muted">
                  {account.subtitle}
                </span>
              </span>

              <span
                aria-hidden="true"
                className="shrink-0 text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
              >
                →
              </span>
            </button>
          </Card>
        ))}
      </ul>
    </section>
  );
}
