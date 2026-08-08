import { SiteHeader } from '@/presentation/components/home/SiteHeader';
import { Marquee } from '@/presentation/components/ui/Marquee';
import { Hero } from '@/presentation/components/home/Hero';
import { LiveTicker } from '@/presentation/components/home/LiveTicker';
import { RoiCalculator } from '@/presentation/components/home/RoiCalculator';
import { RevealText } from '@/presentation/components/ui/RevealText';
import { AmbientBackdrop } from '@/presentation/components/ui/AmbientBackdrop';
import { BlurReveal } from '@/presentation/components/ui/BlurReveal';
import { Parallax } from '@/presentation/components/ui/Parallax';
import { ScrollRolodex } from '@/presentation/components/ui/ScrollRolodex';
import { CreatorShowcase } from '@/presentation/components/home/CreatorShowcase';
import { TrustFooter } from '@/presentation/components/home/TrustFooter';

const MARQUEE_ITEMS = [
  'Criadores verificados',
  'Campanhas de alto ROI',
  'Métricas transparentes',
  'One Million Posts',
] as const;

const STATS = [
  { value: '10 mil+', label: 'Criadores verificados' },
  { value: 'R$ 4,2 mi+', label: 'Movimentados na plataforma' },
  { value: '500+', label: 'Campanhas entregues' },
  { value: '0%', label: 'Comissão oculta' },
] as const;

export function HomeScreen() {
  return (
    <main className="relative">
      <AmbientBackdrop />

      <SiteHeader />

      <Hero />

      <Marquee items={MARQUEE_ITEMS} tone="accent" />

      <section
        id="plataforma"
        className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-6 py-24 md:grid-cols-[0.85fr_1fr] md:items-center"
      >
        <div>
          <p
            className="font-mono text-xs font-bold tracking-widest uppercase"
            style={{ color: 'var(--violet)' }}
          >
            A plataforma em números
          </p>
          <h2 className="font-display mt-3 text-3xl leading-[1.05] font-bold tracking-tighter md:text-5xl">
            Tudo o que a marca vê antes de assinar.
          </h2>
          <p className="mt-5 max-w-sm text-ink-muted">
            Alcance, impressões e retorno projetados entram na negociação como número,
            não como promessa de relatório.
          </p>
        </div>

        {/* Cada card num plano próprio: as distâncias diferentes de parallax é que
            dão profundidade, e a coluna deslocada evita a grade rígida. */}
        <dl className="grid grid-cols-2 gap-5">
          {STATS.map((stat, i) => (
            <Parallax key={stat.label} distance={i % 2 === 0 ? 34 : 68}>
              <div
                className={`h-full border-(length:--border-width) border-line bg-surface-raised px-6 py-7 ${
                  i % 2 === 1 ? 'md:translate-y-8' : ''
                }`}
                style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
              >
                <dt
                  className="font-display text-4xl leading-none font-bold"
                  style={{ color: 'var(--accent)' }}
                >
                  {stat.value}
                </dt>
                <dd className="mt-2 text-xs tracking-wide text-ink-muted uppercase">
                  {stat.label}
                </dd>
              </div>
            </Parallax>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-5xl">
          <RevealText text="Cada campanha nasce com número na mesa," />
          <br />
          <RevealText
            text="não só promessa depois do relatório."
            className="text-ink-muted"
          />
        </h2>
      </section>

      <ScrollRolodex words={['Número na mesa']} variant="band" />

      <div id="projecao" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <BlurReveal>
            <LiveTicker />
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <RoiCalculator />
          </BlurReveal>
        </div>
      </div>

      <Marquee items={MARQUEE_ITEMS} tone="surface" />

      <ScrollRolodex words={['Transparência']} variant="band" />

      <CreatorShowcase />

      <ScrollRolodex words={['Pagamento em custódia']} variant="band" />

      <TrustFooter />
    </main>
  );
}
