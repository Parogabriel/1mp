'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ThemeSwitcher } from '@/presentation/components/ui/ThemeSwitcher';
import { NavPanels, NAV_PANELS, type NavPanelKey } from '@/presentation/components/home/NavPanels';

/**
 * Navbar fixa e transparente sobre o hero.
 *
 * Os itens abrem painéis em vez de rolar para uma seção: são assuntos que
 * merecem explicação própria, e mandar a pessoa para um pedaço da home fazia
 * ela perder o lugar onde estava.
 */
export function SiteHeader() {
  const [openKey, setOpenKey] = useState<NavPanelKey | null>(null);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10 sm:py-5 md:px-14">
        <Link href="/" className="font-display text-base font-semibold tracking-tight">
          1MP<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_PANELS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setOpenKey(item.key)}
              className="text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link
            href="/brand/dashboard"
            className="px-5 py-2.5 text-sm font-medium transition-opacity duration-200 hover:opacity-90"
            style={{
              background: 'var(--ink)',
              color: 'var(--surface)',
              borderRadius: 'var(--radius)',
            }}
          >
            Agendar demo
          </Link>
        </div>
      </header>

      <NavPanels openKey={openKey} onClose={() => setOpenKey(null)} />
    </>
  );
}
