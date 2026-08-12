'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SignInMenu } from '@/presentation/components/home/SignInMenu';
import { SettingsPanel } from '@/presentation/components/layout/SettingsPanel';

/**
 * Topo do site: marca, configurações e entrar. Só isso.
 *
 * A lista de seções ("O produto", "Como funciona", "Criadores", "Preços") saiu
 * daqui. Ela duplicava a própria página — quem rola encontra as mesmas seções
 * na ordem em que o argumento é construído, e um índice fixo por cima disso só
 * competia com o conteúdo e comia a primeira dobra. Os ids das seções continuam
 * de pé (`#produto`, `#como-funciona`, `#criadores`, `#precos`), então links
 * diretos e o "ver na página" dos `NavPanels` seguem funcionando.
 *
 * Com a lista fora, o menu sanfona de mobile perdeu a razão de existir: o
 * `SignInMenu` já se vira em tela estreita, então agora aparece em todos os
 * tamanhos.
 */
export function SiteHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 sm:px-10 sm:py-5 md:px-14">
          <Link href="/" className="font-display text-base font-semibold tracking-tight">
            1MP<span style={{ color: 'var(--accent)' }}>.</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/sobre"
              className="hidden px-3 text-sm text-ink-muted transition-colors duration-200 hover:text-ink sm:block"
            >
              Sobre
            </Link>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Configurações"
              title="Configurações"
              className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:text-ink"
            >
              <GearIcon />
            </button>

            <SignInMenu />
          </div>
        </div>
      </header>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

const ICON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'size-[18px]',
};

function GearIcon() {
  return (
    <svg {...ICON}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
