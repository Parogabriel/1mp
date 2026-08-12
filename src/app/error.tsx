'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Fronteira de erro do App Router.
 *
 * `'use client'` é obrigatório aqui — o Next exige, porque `reset` é uma função
 * passada para o cliente. Mostra o `digest` quando existe: é o identificador
 * que aparece no log do servidor e permite cruzar o que o usuário viu com o
 * que de fato aconteceu.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Sem serviço de erro configurado, o console é o único destino honesto.
    console.error('Erro não tratado na rota:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p
        className="text-xs font-medium tracking-widest uppercase"
        style={{ color: 'var(--signal)' }}
      >
        Algo quebrou
      </p>
      <h1 className="font-display mt-3 text-3xl font-normal tracking-tight md:text-4xl">
        Não conseguimos carregar esta tela.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        O erro foi registrado. Você pode tentar de novo — se persistir, os dados de
        demonstração podem ser repovoados pelo God Mode.
      </p>

      {error.digest && (
        <p className="mt-3 text-xs tabular-nums text-ink-muted">
          Referência: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-card px-5 py-2.5 text-sm font-medium transition-opacity duration-200 hover:opacity-90"
          style={{ background: 'var(--ink)', color: 'var(--surface)' }}
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="rounded-card border-(length:--border-width) border-line px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-surface"
        >
          Voltar à home
        </Link>
      </div>
    </main>
  );
}
