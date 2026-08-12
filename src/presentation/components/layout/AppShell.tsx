'use client';

import type { ReactNode } from 'react';
import { SideNav } from '@/presentation/components/layout/SideNav';
import { AmbientBackdrop } from '@/presentation/components/ui/AmbientBackdrop';

interface AppShellProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle?: ReactNode;
  /** Ação principal do painel — criar campanha, por exemplo. */
  readonly primaryAction?: ReactNode;
  readonly children: ReactNode;
}

/**
 * Moldura dos painéis: coluna de navegação à esquerda, conteúdo à direita.
 *
 * A barra superior virou lateral porque o painel usa a largura inteira — uma
 * faixa no topo custava altura em toda rolagem, e os destinos (criador, marca,
 * configurações) ficam mais estáveis numa coluna própria.
 */
export function AppShell({
  eyebrow,
  title,
  subtitle,
  primaryAction,
  children,
}: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      <AmbientBackdrop />
      <SideNav />

      <main className="min-w-0 flex-1">
        {/* Cabeçalho de ferramenta, não de página de marketing: título em escala
            de trabalho e a sobrelinha na mesma linha, o que devolve ~110px de
            altura em toda rolagem. */}
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2.5">
                <h1 className="font-display text-2xl leading-none font-normal tracking-tight">
                  {title}
                </h1>
                <span
                  className="text-[11px] font-medium tracking-widest uppercase"
                  style={{ color: 'var(--violet)' }}
                >
                  {eyebrow}
                </span>
              </div>
              {subtitle && <div className="mt-1.5 text-xs text-ink-muted">{subtitle}</div>}
            </div>

            {primaryAction}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
