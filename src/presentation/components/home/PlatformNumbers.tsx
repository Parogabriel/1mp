'use client';

import { useMemo } from 'react';
import { cents, formatBRL } from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { Parallax } from '@/presentation/components/ui/Parallax';
import { LiveTicker } from './LiveTicker';

/**
 * Os números do ambiente — contados, não escritos.
 *
 * Esta seção exibia "10 mil+ criadores" e "R$ 4,2 mi+ movimentados". São números
 * que a aplicação não tem como sustentar: a store inteira tem três criadores. A
 * regra do projeto é que nada apareça na UI sem existir no domínio, e uma home
 * que abre mentindo sobre o próprio tamanho contradiz a única coisa que o
 * produto vende, que é o número ser verificável.
 *
 * Então os quatro passaram a ser lidos da store, e o título diz de que universo
 * eles falam. Se alguém semear de novo pelo God Mode, a seção acompanha.
 */
export function PlatformNumbers() {
  const creators = useWorkspaceStore((s) => s.creators);
  const brands = useWorkspaceStore((s) => s.brands);
  const campaigns = useWorkspaceStore((s) => s.campaigns);

  const stats = useMemo(() => {
    const creatorList = Object.values(creators);
    const campaignList = Object.values(campaigns);

    const verified = creatorList.filter((c) => c.verified).length;
    const negotiated = campaignList.reduce((sum, c) => sum + c.offerCents, 0);
    const concluded = campaignList.filter(
      (c) => c.status === 'delivered' || c.status === 'paid',
    ).length;

    return [
      {
        value: String(creatorList.length),
        label: 'Criadores no ambiente',
        hint: `${verified} com selo de verificado`,
      },
      {
        value: formatBRL(cents(negotiated)),
        label: 'Em campanhas negociadas',
        hint: 'soma das ofertas registradas',
      },
      {
        value: String(concluded),
        label: 'Campanhas concluídas',
        hint: 'entregues ou pagas',
      },
      {
        value: String(Object.keys(brands).length),
        label: 'Marcas contratando',
        hint: 'com orçamento aberto',
      },
    ];
  }, [creators, brands, campaigns]);

  return (
    /* A divisão em duas colunas só entra no `lg`: no `md` ela espremia os cards de
       número a ponto de "R$ 30.400,00" estourar a caixa. */
    <section
      id="plataforma"
      className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-6 py-24 lg:grid-cols-[0.85fr_1fr] lg:items-start"
    >
      <div>
        <p
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--violet)' }}
        >
          Neste ambiente, agora
        </p>
        <h2 className="font-display mt-3 text-3xl leading-[1.05] font-normal tracking-tight md:text-5xl">
          Tudo o que a marca vê antes de assinar.
        </h2>
        <p className="mt-5 max-w-sm text-ink-muted">
          Alcance, impressões e retorno projetados entram na negociação como número, não
          como promessa de relatório — e sem comissão escondida no cachê do criador.
        </p>

        {/* A margem vive no próprio ticker: num wrapper, ela sobraria como
            espaço órfão quando a flag do God Mode o desliga e ele volta null. */}
        <LiveTicker className="mt-8" />
      </div>

      {/* Cada card num plano próprio: as distâncias diferentes de parallax é que
          dão profundidade, e a coluna deslocada evita a grade rígida. */}
      <dl className="grid gap-5 sm:grid-cols-2">
        {stats.map((stat, i) => (
          <Parallax key={stat.label} distance={i % 2 === 0 ? 34 : 68}>
            <div
              className={`rounded-card h-full border-(length:--border-width) border-line bg-surface-raised px-6 py-7 shadow-lift ${
                i % 2 === 1 ? 'lg:translate-y-8' : ''
              }`}
            >
              <dt
                className="font-display text-2xl leading-none font-normal tabular-nums lg:text-3xl"
                style={{ color: 'var(--accent)' }}
              >
                {stat.value}
              </dt>
              <dd className="mt-2 text-xs tracking-wide text-ink-muted uppercase">
                {stat.label}
              </dd>
              <dd className="mt-1 text-[11px] text-ink-muted">{stat.hint}</dd>
            </div>
          </Parallax>
        ))}
      </dl>
    </section>
  );
}
