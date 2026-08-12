'use client';

import { motion } from 'framer-motion';

/**
 * Os três momentos de uma campanha na plataforma, na ordem em que acontecem.
 *
 * Antes eram adjetivos soltos ("Projetado", "Conectado", "Auditável") que não
 * diziam o que a plataforma faz nem em que ordem — rótulo sem informação.
 */
const PILLARS = [
  {
    n: '01',
    label: 'Antes de assinar',
    detail: 'Alcance e retorno projetados entram na proposta.',
  },
  {
    n: '02',
    label: 'Durante a campanha',
    detail: 'Briefing, aprovação e prazo num fluxo só.',
  },
  {
    n: '03',
    label: 'Na entrega',
    detail: 'Métricas lidas na plataforma liberam o pagamento.',
  },
] as const;

/**
 * Primeira dobra: uma composição só — marca, headline, uma frase, CTA e vídeo
 * full-bleed, com o painel "o que fazemos" ancorado no rodapé da viewport.
 *
 * Sem scroll-jacking e sem seção esticada: a altura é exatamente uma tela, então
 * o primeiro gesto de rolagem já entrega conteúdo novo.
 */
export function Hero() {
  return (
    <section className="relative flex h-screen flex-col items-center overflow-hidden">
      {/* A malha vem do AmbientBackdrop, que cobre a página inteira — o hero só
          põe o véu de legibilidade por cima dela. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--surface) var(--hero-scrim-top), transparent) 8%, color-mix(in srgb, var(--surface) var(--hero-scrim-mid), transparent) 34%, transparent 62%)',
        }}
      />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center">
        <div className="flex flex-col items-center px-4 pt-20 text-center sm:px-6 md:pt-24">
          <h1 className="font-display text-4xl leading-[1.1] font-normal tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl">
            Conecte marcas
            <br />
            aos creators.
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted sm:mt-6 sm:max-w-md md:mt-8 md:text-base">
            Marketplace de campanhas onde marcas e criadores negociam vendo alcance,
            impressões e retorno projetados antes de assinar — não depois do relatório.
          </p>

          {/* Os CTAs subiram para o menu "Entrar" do topo. No lugar fica um
              convite discreto a rolar — sem ele o hero ficava pesado embaixo,
              já que a seção é h-screen com o painel preso ao rodapé. */}
          <motion.div
            aria-hidden="true"
            className="mt-10 flex flex-col items-center gap-2 text-ink-muted"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-[11px] tracking-widest uppercase">Role para ver</span>
            <span className="text-sm leading-none">↓</span>
          </motion.div>
        </div>

        {/* Encostado no fim da viewport: sem borda nem raio embaixo, para o painel
            parecer que continua na dobra seguinte em vez de terminar ali. */}
        <div className="mt-auto w-full max-w-5xl px-4 sm:px-6">
          <div
            className="border-(length:--border-width) border-b-0 border-line px-5 pt-6 pb-0 backdrop-blur-sm sm:px-8 sm:pt-8 md:px-12 md:pt-10"
            style={{
              background: 'color-mix(in srgb, var(--surface-raised) 90%, transparent)',
              borderRadius: 'var(--radius) var(--radius) 0 0',
              boxShadow: 'var(--shadow-hard-sm)',
            }}
          >
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-16">
              <div>
                <p className="text-[11px] font-medium tracking-[0.2em] text-ink-muted uppercase">
                  O que fazemos?
                </p>
                <h2 className="font-display mt-3 text-2xl leading-tight font-normal tracking-tight sm:text-3xl md:text-4xl">
                  Tiramos o achismo
                  <br className="hidden sm:block" /> da negociação
                </h2>
              </div>

              <div className="flex items-end">
                <p className="text-sm leading-relaxed text-ink-muted md:text-[15px]">
                  Hoje a marca fecha a campanha por print de dashboard e só descobre o
                  que comprou no relatório. Aqui os dois lados veem a mesma conta —
                  alcance, engajamento e retorno — antes de qualquer assinatura.
                </p>
              </div>
            </div>

            <div className="mt-5 h-px w-full bg-line sm:mt-6 md:mt-7" />

            <ul className="mt-5 grid gap-2 pb-5 sm:grid-cols-3 sm:gap-3 sm:pb-6">
              {PILLARS.map((pillar) => (
                <li
                  key={pillar.n}
                  className="px-4 py-3.5 sm:px-5 sm:py-4"
                  style={{ background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }}
                >
                  <p className="flex items-center gap-2 text-sm">
                    <span className="tabular-nums text-xs text-ink-muted">{pillar.n}</span>
                    <span className="font-medium">{pillar.label}</span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    {pillar.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
