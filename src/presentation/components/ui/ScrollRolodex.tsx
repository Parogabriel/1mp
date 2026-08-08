'use client';

import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useScrollOpacity } from '@/presentation/hooks/useScrollOpacity';

export type RolodexVariant = 'hero' | 'band';

/**
 * vh de rolagem consumidos por palavra.
 *
 * Curto de propósito: seção sticky longa faz a página parecer travada — você
 * rola e nada além de uma palavra se mexe. Aqui cada palavra custa pouco mais
 * de meia tela, então a página sempre responde ao gesto.
 */
const STEP_VH: Readonly<Record<RolodexVariant, number>> = { hero: 62, band: 62 };

/**
 * Altura do painel — também a altura de cada linha do track.
 *
 * Com folga sobre a caixa de texto: acento de maiúscula sobe acima da altura de
 * caixa alta e a cedilha desce abaixo da linha de base. Painel justo cortaria os
 * dois — e em português isso aparece em quase toda palavra.
 */
const PANEL_VH: Readonly<Record<RolodexVariant, number>> = { hero: 27, band: 16 };

/** vh extras no fim do hero para a headline entrar depois da última palavra. */
const TAIL_VH = 100;

/** Fração da fatia em que a palavra fica parada antes de virar. */
const DWELL = 0.6;

interface ScrollRolodexProps {
  readonly words: readonly string[];
  readonly variant: RolodexVariant;
  /** Entra depois da última palavra (a headline, no hero). */
  readonly children?: ReactNode;
  readonly className?: string;
}

/**
 * Painel de palavras que rola por dentro de uma máscara fixa, no ritmo do scroll.
 *
 * O track anda em degraus, não linearmente: cada palavra fica parada por 60% da
 * sua fatia e vira nos 40% restantes. Interpolação linear faria o texto deslizar
 * sem nunca assentar — é o degrau que dá a sensação de contador mecânico.
 */
export function ScrollRolodex({ words, variant, children, className }: ScrollRolodexProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const panelVh = PANEL_VH[variant];
  const wordsVh = words.length * STEP_VH[variant];
  const tailVh = children ? TAIL_VH : 0;
  const totalVh = wordsVh + tailVh;

  /** Onde as palavras terminam, em fração do progresso total da seção. */
  const wordsEnd = wordsVh / totalVh;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const [trackInput, trackOutput] = useMemo(
    () => buildStepRamp(words.length, wordsEnd, panelVh),
    [words.length, wordsEnd, panelVh],
  );

  const trackY = useTransform(scrollYProgress, trackInput, trackOutput);
  const childrenY = useTransform(scrollYProgress, [wordsEnd, wordsEnd + 0.14], [36, 0]);

  const panelRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);

  // O painel some junto com a chegada da headline; sem isso os dois se sobrepõem.
  // Sem `children` a banda não tem para onde ceder, então fica sempre visível.
  useScrollOpacity(
    scrollYProgress,
    panelRef,
    [wordsEnd * 0.92, Math.min(wordsEnd + 0.08, 1)],
    children ? [1, 0] : [1, 1],
  );

  useScrollOpacity(scrollYProgress, tailRef, [wordsEnd, wordsEnd + 0.14], [0, 1]);

  // Sem sticky nem seção esticada: só o conteúdo, na ordem de leitura.
  if (reduceMotion) {
    return (
      <section className={className}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className={variant === 'hero' ? HERO_TYPE : BAND_TYPE}>{words.join(' · ')}</p>
        </div>
        {children}
      </section>
    );
  }

  return (
    <div
      ref={sectionRef}
      className={className}
      // A custom property fica aqui e herda até .rolodex-panel e .rolodex-row —
      // pôr no motion.div esbarraria no tipo, que não aceita MotionValue junto.
      style={{ height: `${totalVh}vh`, '--rolodex-panel-h': `${panelVh}vh` } as CSSProperties}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          <div ref={panelRef} className="rolodex-panel mx-auto w-full max-w-6xl px-6">
            <motion.div style={{ y: trackY }}>
              {words.map((word) => (
                <div key={word} className="rolodex-row">
                  <span className={variant === 'hero' ? HERO_TYPE : BAND_TYPE}>{word}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {children && (
          <motion.div
            ref={tailRef}
            className="absolute inset-0 flex items-center"
            style={{ y: childrenY }}
          >
            <div className="mx-auto w-full max-w-6xl px-6">{children}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const HERO_TYPE =
  'font-display block text-[13vw] leading-[0.85] font-bold tracking-tighter uppercase';

const BAND_TYPE =
  'font-display block text-[7vw] leading-[0.9] font-bold tracking-tighter uppercase';

/**
 * Rampa em degraus para o track: pares (progresso, deslocamento) onde cada
 * palavra tem um trecho parado seguido de um trecho de virada.
 */
function buildStepRamp(
  count: number,
  wordsEnd: number,
  panelVh: number,
): [number[], string[]] {
  const input: number[] = [];
  const output: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const start = (wordsEnd * i) / count;
    const end = (wordsEnd * (i + 1)) / count;
    const dwellEnd = start + (end - start) * DWELL;
    const offset = `${-i * panelVh}vh`;

    input.push(start, dwellEnd);
    output.push(offset, offset);

    // A última palavra não vira: segura a posição até o fim da seção.
    if (i === count - 1) {
      input.push(1);
      output.push(offset);
    }
  }

  return [input, output];
}
