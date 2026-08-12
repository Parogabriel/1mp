import Link from 'next/link';

/**
 * 404 do App Router.
 *
 * Server component de propósito: uma página de erro não deve depender de
 * hidratação para aparecer.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium tracking-widest text-ink-muted uppercase">
        Erro 404
      </p>
      <h1 className="font-display mt-3 text-4xl font-normal tracking-tight md:text-5xl">
        Esta página não existe.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        O endereço pode ter mudado, ou o link que te trouxe até aqui está velho.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-card px-5 py-2.5 text-sm font-medium transition-opacity duration-200 hover:opacity-90"
          style={{ background: 'var(--ink)', color: 'var(--surface)' }}
        >
          Voltar à home
        </Link>
        <Link
          href="/entrar"
          className="rounded-card border-(length:--border-width) border-line px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-surface"
        >
          Entrar na plataforma
        </Link>
      </div>
    </main>
  );
}
