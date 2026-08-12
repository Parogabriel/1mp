import { SiteHeader } from '@/presentation/components/home/SiteHeader';
import { Marquee } from '@/presentation/components/ui/Marquee';
import { Hero } from '@/presentation/components/home/Hero';
import { RevealText } from '@/presentation/components/ui/RevealText';
import { AmbientBackdrop } from '@/presentation/components/ui/AmbientBackdrop';
import { WordBand } from '@/presentation/components/ui/WordBand';
import { BrandStrip } from '@/presentation/components/home/BrandStrip';
import { ProductTour } from '@/presentation/components/home/ProductTour';
import { PlatformNumbers } from '@/presentation/components/home/PlatformNumbers';
import { CreatorShowcase } from '@/presentation/components/home/CreatorShowcase';
import { HowItWorks } from '@/presentation/components/home/HowItWorks';
import { ProofCases } from '@/presentation/components/home/ProofCases';
import { WhyUs } from '@/presentation/components/home/WhyUs';
import { Testimonials } from '@/presentation/components/home/Testimonials';
import { AboutUs } from '@/presentation/components/home/AboutUs';
import { Pricing } from '@/presentation/components/home/Pricing';
import { Faq } from '@/presentation/components/home/Faq';
import { TrustFooter } from '@/presentation/components/home/TrustFooter';

const MARQUEE_ITEMS = [
  'Criadores verificados',
  'Campanhas de alto ROI',
  'Métricas transparentes',
  'One Million Posts',
] as const;

/**
 * Composição da home.
 *
 * A ordem responde a quatro queixas concretas sobre a versão anterior: a página
 * não mostrava o produto, tudo tinha a mesma forma, faltava conteúdo de venda e
 * faltava imagem.
 *
 * Daí o produto de verdade subir para logo depois da primeira dobra
 * (`ProductTour`), o argumento passar por prova antes de chegar ao preço
 * (`ProofCases` → `Testimonials` → `Pricing`), e as seções vizinhas nunca
 * repetirem o mesmo esqueleto: trilho vertical, lista larga, citação
 * assimétrica, grade de cards e acordeão se alternam de propósito.
 *
 * As faixas de interrupção (marquee e rolodex) caíram de cinco para três — eram
 * elas que davam à rolagem a sensação de estar sempre no mesmo lugar.
 */
export function HomeScreen() {
  return (
    <main className="relative">
      <AmbientBackdrop />

      <SiteHeader />

      <Hero />

      <Marquee items={MARQUEE_ITEMS} tone="accent" />

      <BrandStrip />

      {/* O produto antes da explicação sobre o produto: quem rola uma tela já vê
          a aplicação rodando, em vez de mais um parágrafo sobre ela. */}
      <ProductTour />

      <PlatformNumbers />

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

      <WordBand word="Número na mesa" />

      <HowItWorks />

      <ProofCases />

      <WhyUs />

      <WordBand word="Transparência" />

      <CreatorShowcase />

      <Testimonials />

      <Pricing />

      <AboutUs />

      <Faq />

      <WordBand word="Pagamento em custódia" />

      <TrustFooter />
    </main>
  );
}
