import { Skeleton } from '@/presentation/components/ui/EmptyState';

/**
 * Esqueleto de carregamento de rota.
 *
 * `aria-busy` + `aria-live` no container: sem isso o leitor de tela apenas
 * encontra a página vazia, sem saber que há algo a caminho.
 */
export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-5 h-12 w-3/4 max-w-2xl" />
      <Skeleton className="mt-3 h-4 w-1/2 max-w-md" />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </main>
  );
}
