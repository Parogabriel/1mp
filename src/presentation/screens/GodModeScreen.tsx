'use client';

import { useId, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { fromPercent, toPercent } from '@/domain';
import { useGodModeStore, type FeatureFlags } from '@/application/stores/useGodModeStore';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { ThemeSwitcher } from '@/presentation/components/ui/ThemeSwitcher';

const FLAG_LABELS: Readonly<Record<keyof FeatureFlags, { label: string; hint: string }>> = {
  maintenanceMode: {
    label: 'Modo manutenção',
    hint: 'Sinaliza indisponibilidade programada para os portais.',
  },
  liveTicker: { label: 'Live Ticker', hint: 'Fita de transações recentes na Home.' },
  roiCalculator: { label: 'Calculadora de ROI', hint: 'Bloco interativo de projeção na Home.' },
};

const FLAG_KEYS = Object.keys(FLAG_LABELS) as ReadonlyArray<keyof FeatureFlags>;

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function GodModeScreen() {
  const isUnlocked = useGodModeStore((s) => s.isUnlocked);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-sm font-bold tracking-tighter">
          1MP<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <ThemeSwitcher />
      </header>

      <div className="mt-10">
        <p
          className="font-mono text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--signal)' }}
        >
          Sys-admin
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tighter">God Mode</h1>
      </div>

      <div className="mt-8">{isUnlocked ? <ControlPanel /> : <PasscodeGate />}</div>
    </main>
  );
}

function PasscodeGate() {
  const unlock = useGodModeStore((s) => s.unlock);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const inputId = useId();
  const errorId = useId();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const ok = unlock(passcode);
    setError(!ok);
    if (ok) setPasscode('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-(length:--border-width) border-line bg-surface-raised p-6"
      style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
    >
      <label htmlFor={inputId} className="block text-xs font-bold tracking-widest uppercase">
        Passcode
      </label>
      <input
        id={inputId}
        type="password"
        value={passcode}
        onChange={(e) => {
          setPasscode(e.target.value);
          setError(false);
        }}
        autoComplete="off"
        aria-invalid={error}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 w-full border-(length:--border-width) border-line bg-surface px-3 py-2 font-mono text-sm"
        style={{ borderRadius: 'var(--radius)' }}
      />

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs" style={{ color: 'var(--signal)' }}>
          Passcode incorreto.
        </p>
      )}

      <button
        type="submit"
        className="mt-4 border-(length:--border-width) border-line px-5 py-2 text-xs font-bold tracking-widest uppercase"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          borderRadius: 'var(--radius-pill)',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        Destrancar
      </button>

      <p className="mt-4 text-[11px] text-ink-muted">
        Este gate é de demonstração local. O passcode vive no bundle do client e é visível no
        DevTools — antes de tocar em dado real, isto precisa virar autenticação de servidor.
      </p>
    </form>
  );
}

function ControlPanel() {
  const flags = useGodModeStore((s) => s.flags);
  const platformFee = useGodModeStore((s) => s.platformFee);
  const lastSeedAt = useGodModeStore((s) => s.lastSeedAt);
  const toggleFlag = useGodModeStore((s) => s.toggleFlag);
  const setPlatformFee = useGodModeStore((s) => s.setPlatformFee);
  const resetFlags = useGodModeStore((s) => s.resetFlags);
  const lock = useGodModeStore((s) => s.lock);

  const seed = useWorkspaceStore((s) => s.seed);
  const campaignCount = useWorkspaceStore((s) => Object.keys(s.campaigns).length);

  const feeId = useId();

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="flags-heading"
        className="border-(length:--border-width) border-line bg-surface-raised p-6"
        style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
      >
        <h2 id="flags-heading" className="text-lg font-bold tracking-tight">
          Feature flags
        </h2>
        <ul className="mt-4 space-y-3">
          {FLAG_KEYS.map((key) => (
            <li key={key} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold">{FLAG_LABELS[key].label}</p>
                <p className="text-[11px] text-ink-muted">{FLAG_LABELS[key].hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={flags[key]}
                aria-label={FLAG_LABELS[key].label}
                onClick={() => toggleFlag(key)}
                className="shrink-0 border-(length:--border-width) border-line px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  background: flags[key] ? 'var(--accent)' : 'transparent',
                  color: flags[key] ? 'var(--accent-ink)' : 'var(--ink-muted)',
                }}
              >
                {flags[key] ? 'Ligado' : 'Desligado'}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="fee-heading"
        className="border-(length:--border-width) border-line bg-surface-raised p-6"
        style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
      >
        <h2 id="fee-heading" className="text-lg font-bold tracking-tight">
          Taxa da plataforma
        </h2>
        <div className="mt-4 flex items-baseline justify-between">
          <label htmlFor={feeId} className="text-xs font-bold tracking-widest uppercase">
            Percentual sobre cada campanha fechada
          </label>
          <output htmlFor={feeId} className="font-mono text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            {toPercent(platformFee).toFixed(1)}%
          </output>
        </div>
        <input
          id={feeId}
          type="range"
          min={0}
          max={40}
          step={0.5}
          value={toPercent(platformFee)}
          onChange={(e) => setPlatformFee(fromPercent(Number(e.target.value)))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </section>

      <section
        aria-labelledby="seed-heading"
        className="border-(length:--border-width) border-line bg-surface-raised p-6"
        style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
      >
        <h2 id="seed-heading" className="text-lg font-bold tracking-tight">
          One-Click Seed
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Popula o workspace local com criadores, marcas, campanhas e posts de demonstração.
          Substitui o conteúdo atual.
        </p>

        <button
          type="button"
          onClick={seed}
          className="mt-4 border-(length:--border-width) border-line px-5 py-2 text-xs font-bold tracking-widest uppercase"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          Popular banco local
        </button>

        <p role="status" className="mt-3 text-[11px] text-ink-muted">
          {lastSeedAt
            ? `Último seed em ${dateTimeFormatter.format(lastSeedAt)} · ${campaignCount} campanhas no workspace.`
            : 'Nenhum seed executado nesta instalação ainda.'}
        </p>
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={resetFlags}
          className="border-(length:--border-width) border-line px-4 py-2 text-xs font-bold tracking-widest uppercase"
          style={{ borderRadius: 'var(--radius-pill)' }}
        >
          Restaurar padrões
        </button>
        <button
          type="button"
          onClick={lock}
          className="border-(length:--border-width) border-line px-4 py-2 text-xs font-bold tracking-widest uppercase"
          style={{ borderRadius: 'var(--radius-pill)', color: 'var(--signal)' }}
        >
          Trancar
        </button>
      </div>
    </div>
  );
}
