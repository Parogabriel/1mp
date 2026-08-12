'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAuthStore, type SessionRole } from '@/application/stores/useAuthStore';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { Skeleton } from '@/presentation/components/ui/EmptyState';

const PANEL_OF: Readonly<Record<'creator' | 'brand', { href: string; label: string }>> = {
  creator: { href: '/creator/dashboard', label: 'Creator Studio' },
  brand: { href: '/brand/dashboard', label: 'Brand Manager' },
};

interface RequireRoleProps {
  readonly role: 'creator' | 'brand';
  readonly children: ReactNode;
}

/**
 * Mostra o conteúdo só para a sessão do papel certo.
 *
 * Isto é UX, não segurança: a store é do client e qualquer pessoa edita o
 * localStorage. Serve para cada perfil ver o painel que lhe diz respeito, e
 * para quem chega deslogado entender o que fazer — não para proteger dado.
 *
 * Fica na camada de apresentação, e não em `src/app`, porque os arquivos de
 * rota são cascas de uma linha por convenção do projeto.
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const session = useAuthStore((s) => s.session);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Antes da leitura do localStorage a sessão é sempre `guest`. Decidir aqui
  // expulsaria quem está logado a cada F5.
  if (!isHydrated) return <GateSkeleton />;

  if (session.role === role) return <>{children}</>;

  return session.role === 'guest' ? <SignedOutGate /> : <WrongRoleGate role={session.role} />;
}

function GateSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando sessão…</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-4 h-4 w-80" />
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

function SignedOutGate() {
  return (
    <GateShell
      title="Entre para ver este painel"
      description="Escolha um perfil de demonstração — criador ou marca — e o painel correspondente abre com dados de exemplo."
    >
      <Link href="/entrar">
        <Button variant="primary">Escolher perfil</Button>
      </Link>
      <Link href="/">
        <Button variant="secondary">Voltar à home</Button>
      </Link>
    </GateShell>
  );
}

function WrongRoleGate({ role }: { readonly role: Exclude<SessionRole, 'guest'> }) {
  const panel = PANEL_OF[role];

  return (
    <GateShell
      title="Este painel é de outro perfil"
      description={`A sessão ativa é de ${role === 'creator' ? 'criador' : 'marca'}. Seu painel é o ${panel.label} — ou troque de perfil para ver o outro lado.`}
    >
      <Link href={panel.href}>
        <Button variant="primary">Ir para o {panel.label}</Button>
      </Link>
      <Link href="/entrar">
        <Button variant="secondary">Trocar de perfil</Button>
      </Link>
    </GateShell>
  );
}

function GateShell({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <Card padding="lg" elevation="raised" className="w-full">
        <h1 className="font-display text-2xl font-normal tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>
      </Card>
    </div>
  );
}
