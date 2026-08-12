'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { SettingsPanel } from '@/presentation/components/layout/SettingsPanel';
import { useToast } from '@/presentation/components/ui/Toast';

const WIDTH_OPEN = 232;
const WIDTH_CLOSED = 64;

interface NavEntry {
  readonly href: string;
  readonly label: string;
  readonly icon: ReactNode;
  /** Papel exigido; quem não tem cai na troca de perfil em vez de bater no gate. */
  readonly role: 'creator' | 'brand';
}

const ENTRIES: readonly NavEntry[] = [
  { href: '/creator/dashboard', label: 'Criador', icon: <PersonIcon />, role: 'creator' },
  { href: '/brand/dashboard', label: 'Marca', icon: <BuildingIcon />, role: 'brand' },
];

/**
 * Navegação lateral recolhível.
 *
 * Substitui a barra superior: com o painel ocupando a largura toda, uma coluna
 * estreita à esquerda devolve espaço vertical e mantém os destinos sempre à
 * mão. Recolhida vira só os ícones — o rótulo continua no `title` e no
 * `aria-label`, então nada se perde para leitor de tela.
 */
export function SideNav() {
  const [open, setOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const toast = useToast();

  const leave = () => {
    signOut();
    toast.show('Sessão encerrada.', 'info');
    router.push('/');
  };

  return (
    <>
      <motion.nav
        aria-label="Navegação principal"
        animate={{ width: open ? WIDTH_OPEN : WIDTH_CLOSED }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r-(length:--border-width) border-line bg-surface/85 backdrop-blur-md md:flex"
      >
        <div className="flex items-center gap-2 px-3 py-4">
          <Link
            href="/"
            title="Voltar para a home"
            className="font-display flex size-9 shrink-0 items-center justify-center text-sm font-semibold"
          >
            1MP<span style={{ color: 'var(--accent)' }}>.</span>
          </Link>
          {open && (
            <span className="truncate text-xs text-ink-muted">One Million Posts</span>
          )}
        </div>

        <div className="mt-2 flex flex-1 flex-col gap-1 px-3">
          {ENTRIES.map((entry) => {
            const active = pathname.startsWith(entry.href);
            const allowed = session.role === entry.role;

            return (
              <SideLink
                key={entry.href}
                // Quem não tem o papel vai trocar de perfil em vez de bater
                // no gate e ver um aviso de acesso negado.
                href={allowed ? entry.href : '/entrar'}
                label={entry.label}
                hint={allowed ? undefined : 'trocar de perfil'}
                icon={entry.icon}
                active={active && allowed}
                open={open}
              />
            );
          })}

          <div className="my-2 h-px bg-line" />

          <SideButton
            label="Configurações"
            icon={<GearIcon />}
            open={open}
            onClick={() => setSettingsOpen(true)}
          />
          <SideLink href="/" label="Home" icon={<HomeIcon />} open={open} />
        </div>

        <div className="border-t-(length:--border-width) border-line px-3 py-3">
          {open && session.email && (
            <p className="mb-2 truncate text-[11px] text-ink-muted" title={session.email}>
              {session.displayName}
            </p>
          )}
          <SideButton label="Sair" icon={<ExitIcon />} open={open} onClick={leave} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Recolher menu' : 'Expandir menu'}
          className="mx-3 mb-3 flex items-center justify-center rounded-full border-(length:--border-width) border-line py-2 text-ink-muted transition-colors duration-200 hover:text-ink"
        >
          <motion.span
            aria-hidden="true"
            animate={{ rotate: open ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="text-sm leading-none"
          >
            ‹
          </motion.span>
        </button>
      </motion.nav>

      {/* Abaixo de md a coluna some e vira uma barra no topo — coluna fixa numa
          tela estreita comeria metade da largura útil. */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b-(length:--border-width) border-line bg-surface/85 px-4 py-3 backdrop-blur-md md:hidden">
        <Link href="/" className="font-display text-sm font-semibold">
          1MP<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Configurações"
            className="text-ink-muted hover:text-ink"
          >
            <GearIcon />
          </button>
          <button type="button" onClick={leave} className="text-xs text-ink-muted">
            Sair
          </button>
        </div>
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

function SideLink({
  href,
  label,
  hint,
  icon,
  active,
  open,
}: {
  readonly href: string;
  readonly label: string;
  readonly hint?: string;
  readonly icon: ReactNode;
  readonly active?: boolean;
  readonly open: boolean;
}) {
  return (
    <Link
      href={href}
      title={open ? undefined : label}
      aria-label={open ? undefined : label}
      aria-current={active ? 'page' : undefined}
      className="relative flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors duration-200"
      style={{
        background: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-muted)',
      }}
    >
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
      {open && (
        <span className="min-w-0 flex-1 truncate">
          {label}
          {hint && <span className="ml-1.5 text-[11px] text-ink-muted">({hint})</span>}
        </span>
      )}
    </Link>
  );
}

function SideButton({
  label,
  icon,
  open,
  onClick,
}: {
  readonly label: string;
  readonly icon: ReactNode;
  readonly open: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={open ? undefined : label}
      aria-label={open ? undefined : label}
      className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
    >
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
      {open && <span className="truncate">{label}</span>}
    </button>
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

function GearIcon() {
  return (
    <svg {...ICON}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg {...ICON}>
      <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 21v-7h6v7" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg {...ICON}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}
