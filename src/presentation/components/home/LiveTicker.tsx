'use client';

import { useEffect, useRef, useState } from 'react';
import { cents, formatBRL, type Cents } from '@/domain';
import { useGodModeStore } from '@/application/stores/useGodModeStore';
import { useGsapListEnter } from '@/presentation/hooks/useGsapListEnter';
import { DEMO_BRAND_NAMES } from './demoBrands';

interface Transaction {
  readonly id: string;
  readonly creator: string;
  readonly brand: string;
  readonly amount: Cents;
}

const CREATORS: readonly [string, ...string[]] = [
  '@laismattos',
  '@pedrocorre',
  '@nutri.bru',
  '@joaotech',
  '@camilafit',
];
const BRANDS: readonly [string, ...string[]] = DEMO_BRAND_NAMES;

// Tupla não-vazia + fallback no índice 0: sob `noUncheckedIndexedAccess` o acesso
// por índice calculado é `string | undefined`, mesmo quando a lista nunca é vazia.
const randomFrom = (list: readonly [string, ...string[]]): string =>
  list[Math.floor(Math.random() * list.length)] ?? list[0];

const randomTransaction = (): Transaction => ({
  id: crypto.randomUUID(),
  creator: randomFrom(CREATORS),
  brand: randomFrom(BRANDS),
  amount: cents(Math.round((800 + Math.random() * 14_000) * 100)),
});

const MAX_ROWS = 5;

export function LiveTicker({ className = '' }: { readonly className?: string }) {
  const enabled = useGodModeStore((s) => s.flags.liveTicker);
  const [rows, setRows] = useState<readonly Transaction[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  useGsapListEnter(listRef);

  useEffect(() => {
    if (!enabled) return;

    /*
     * Popula na montagem, não no estado inicial: gerar valor aleatório durante o
     * render dá mismatch de hidratação, porque servidor e client produziriam
     * números diferentes para o mesmo HTML.
     *
     * O React Compiler reclama de setState síncrono dentro de efeito, e está certo
     * no caso geral. Aqui a fonte do dado é externa ao React (um gerador sobre um
     * relógio) e a alternativa seria deixar a fita vazia por 3,2s na primeira
     * carga, o que parece defeito.
     */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(Array.from({ length: MAX_ROWS }, randomTransaction));

    const id = window.setInterval(() => {
      setRows((prev) => [randomTransaction(), ...prev].slice(0, MAX_ROWS));
    }, 3200);

    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <section
      aria-label="Transações recentes na plataforma"
      className={`rounded-card border-(length:--border-width) border-line bg-surface-raised shadow-lift ${className}`}
    >
      <header className="flex items-center gap-2 border-b-(length:--border-width) border-line px-4 py-2.5">
        <span
          className="size-2 animate-pulse"
          style={{ background: 'var(--signal)', borderRadius: '999px' }}
          aria-hidden="true"
        />
        <h2 className="text-xs font-bold tracking-widest uppercase">Fechando agora</h2>
      </header>

      {/* aria-live="polite" anuncia novas linhas sem interromper o que o usuário faz */}
      <ul ref={listRef} className="divide-y divide-line" aria-live="polite" aria-atomic="false">
        {rows.map((t) => (
          <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="truncate">
              <span className="font-semibold">{t.creator}</span>
              <span className="text-ink-muted"> × {t.brand}</span>
            </span>
            <span className="ml-4 tabular-nums font-bold" style={{ color: 'var(--accent)' }}>
              {formatBRL(t.amount)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
