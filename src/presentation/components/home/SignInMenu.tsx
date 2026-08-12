'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const OPTIONS = [
  {
    href: '/entrar?perfil=criador',
    title: 'Sou criador',
    detail: 'Acompanhe campanhas, planeje posts e receba em custódia.',
    icon: <PersonIcon />,
  },
  {
    href: '/entrar?perfil=marca',
    title: 'Sou marca',
    detail: 'Monte briefings, encontre criadores e projete o retorno.',
    icon: <BuildingIcon />,
  },
] as const;

/**
 * Escolha de perfil ancorada no topo.
 *
 * Substitui os dois botões que ocupavam o hero. Popover em vez de página
 * intermediária: a decisão é binária e não merece uma navegação inteira.
 *
 * Fecha com Escape e com clique fora, e move o foco para a primeira opção ao
 * abrir — sem isso o teclado fica preso no botão que abriu.
 */
export function SignInMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    firstOptionRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // `pointerdown` em vez de `click`: fecha antes de o clique chegar em outro
    // controle, evitando abrir e fechar no mesmo gesto.
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-card flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-opacity duration-200 hover:opacity-90"
        style={{ background: 'var(--ink)', color: 'var(--surface)' }}
      >
        Entrar
        <motion.span
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="text-[11px] leading-none"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Escolha seu perfil"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="rounded-card absolute top-full right-0 z-50 mt-2 w-[min(30rem,calc(100vw-2rem))] origin-top-right border-(length:--border-width) border-line bg-surface-raised p-2 shadow-lift"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {OPTIONS.map((option, i) => (
                <Link
                  key={option.href}
                  ref={i === 0 ? firstOptionRef : undefined}
                  href={option.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="rounded-card group flex flex-col gap-2 p-4 transition-colors duration-200 hover:bg-ink/5"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center rounded-full"
                    style={{ background: 'var(--violet)', color: '#ffffff' }}
                  >
                    {option.icon}
                  </span>
                  <span className="text-sm font-medium">{option.title}</span>
                  <span className="text-xs leading-relaxed text-ink-muted">
                    {option.detail}
                  </span>
                </Link>
              ))}
            </div>

            <p className="px-4 py-2 text-[11px] text-ink-muted">
              Ambiente de demonstração — nenhuma senha é pedida.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ICON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'size-4',
};

function PersonIcon() {
  return (
    <svg {...ICON}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg {...ICON}>
      <path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14" />
      <path d="M15 10h3a2 2 0 0 1 2 2v8M3 20h18" />
      <path d="M8 8h3M8 12h3M8 16h3" />
    </svg>
  );
}
