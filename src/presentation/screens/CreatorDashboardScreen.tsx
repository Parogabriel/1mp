'use client';

import Link from 'next/link';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { ThemeSwitcher } from '@/presentation/components/ui/ThemeSwitcher';
import { AmbientBackdrop } from '@/presentation/components/ui/AmbientBackdrop';
import { KanbanBoard } from '@/presentation/components/creator/KanbanBoard';
import { PostStudio } from '@/presentation/components/creator/PostStudio';

export function CreatorDashboardScreen() {
  const session = useAuthStore((s) => s.session);

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-10">
      <AmbientBackdrop />

      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-sm font-bold tracking-tighter">
          1MP<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <nav className="flex items-center gap-3">
          <span className="text-xs text-ink-muted">
            {session.role === 'creator' ? session.displayName : 'Modo demonstração'}
          </span>
          <ThemeSwitcher />
        </nav>
      </header>

      <div className="mt-10">
        <p
          className="font-mono text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--signal)' }}
        >
          Creator Studio
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tighter md:text-5xl">
          Suas campanhas, na mesa.
        </h1>
      </div>

      <section aria-labelledby="kanban-heading" className="mt-12">
        <h2 id="kanban-heading" className="text-lg font-bold tracking-tight">
          Board de campanhas
        </h2>
        <div className="mt-4">
          <KanbanBoard creatorId={session.creatorId} />
        </div>
      </section>

      <section aria-labelledby="studio-heading" className="mt-16">
        <h2 id="studio-heading" className="text-lg font-bold tracking-tight">
          Post Studio
        </h2>
        <div className="mt-4">
          <PostStudio creatorId={session.creatorId} />
        </div>
      </section>
    </main>
  );
}
