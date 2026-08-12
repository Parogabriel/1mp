'use client';

import type { Creator } from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { CreatorCard } from '@/presentation/components/creator/CreatorCard';
import { InfiniteCarousel } from '@/presentation/components/ui/InfiniteCarousel';

/**
 * Vitrine dos criadores em destaque.
 *
 * Lê a mesma store do dashboard — se o God Mode ainda não semeou, a seção
 * some inteira em vez de mostrar um grid vazio.
 */
export function CreatorShowcase() {
  const creators = useWorkspaceStore((s) => s.creators);

  const list = Object.values(creators);
  if (list.length === 0) return null;

  return (
    <section
      id="criadores" aria-labelledby="showcase-heading"
      className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: 'var(--violet)' }}
          >
            Em destaque
          </p>
          <h2
            id="showcase-heading"
            className="font-display mt-2 text-3xl font-bold tracking-tighter md:text-4xl"
          >
            Criadores prontos para fechar.
          </h2>
        </div>
        <p className="max-w-xs text-sm text-ink-muted">
          Métricas auditadas na plataforma — não print de dashboard.
        </p>
      </div>

      {/* O carrossel precisa de itens suficientes para cobrir o trilho, senão a
          volta abre um vão. Com poucos criadores, a lista se repete. */}
      <InfiniteCarousel
        items={loopable(list)}
        itemWidthRatio={0.34}
        className="mt-8 h-[340px] cursor-grab active:cursor-grabbing"
        renderItem={({ item }) => <CreatorCard creator={item} />}
      />

      <p className="mt-4 text-xs text-ink-muted">
        Arraste para explorar — a esteira retoma sozinha.
      </p>
    </section>
  );
}

/** Repete a lista até dar para preencher o trilho sem vão na volta. */
function loopable(list: readonly Creator[]): Creator[] {
  if (list.length === 0) return [];
  const out: Creator[] = [];
  while (out.length < Math.max(6, list.length)) out.push(...list);
  return out;
}
