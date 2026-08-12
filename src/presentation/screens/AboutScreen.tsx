import Link from 'next/link';
import { AmbientBackdrop } from '@/presentation/components/ui/AmbientBackdrop';
import { SiteHeader } from '@/presentation/components/home/SiteHeader';
import { AboutUs } from '@/presentation/components/home/AboutUs';
import { HowItWorks } from '@/presentation/components/home/HowItWorks';
import { TrustFooter } from '@/presentation/components/home/TrustFooter';
import { Card } from '@/presentation/components/ui/Card';

const NUMBERS = [
  { value: '2024', label: 'Ano de fundação' },
  { value: '5', label: 'Etapas até o pagamento' },
  { value: '12', label: 'Métricas por projeção' },
  { value: '0%', label: 'Comissão oculta' },
] as const;

/**
 * Página Sobre.
 *
 * Reúne a história e o funcionamento num endereço próprio, para poder ser
 * compartilhada sem depender de âncora na home. Reaproveita as seções que já
 * existem em vez de duplicar o texto — a prosa vive num lugar só.
 */
export function AboutScreen() {
  return (
    <main className="relative">
      <AmbientBackdrop />
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 pt-32 pb-4 sm:pt-40">
        <p className="text-xs font-medium tracking-widest text-ink-muted uppercase">
          Sobre a 1MP
        </p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] font-normal tracking-tight md:text-6xl">
          Cada post é uma transação que deveria ser mensurável antes de acontecer.
        </h1>

        <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map((item) => (
            <Card key={item.label} padding="md">
              <dd className="font-display text-3xl leading-none font-light tabular-nums">
                {item.value}
              </dd>
              <dt className="mt-2 text-xs text-ink-muted">{item.label}</dt>
            </Card>
          ))}
        </dl>
      </div>

      <AboutUs />
      <HowItWorks />

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight md:text-3xl">
          Quer ver funcionando?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          O ambiente de demonstração abre com dados de exemplo nos dois lados —
          criador e marca.
        </p>
        <Link
          href="/entrar"
          className="rounded-card mt-6 inline-block px-6 py-3 text-sm font-medium transition-opacity duration-200 hover:opacity-90"
          style={{ background: 'var(--ink)', color: 'var(--surface)' }}
        >
          Entrar na plataforma
        </Link>
      </section>

      <TrustFooter />
    </main>
  );
}
