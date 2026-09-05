'use client';

import { useEffect, useRef } from 'react';
import { BASE_PATH } from '@/config';

/** Nós amostrados da imagem. Acima disso a malha empasta e vira mancha. */
const NODE_COUNT = 3200;

/** Raio de ligação, em fração da caixa. Define a densidade da teia. */
const LINK_RADIUS = 0.02;

/** Teto de arestas por nó — sem isto as regiões densas viram bloco sólido. */
const MAX_LINKS_PER_NODE = 3;

/**
 * Lado maior da máscara offscreen.
 *
 * Generoso de propósito: a referência é feita de fios brancos finos sobre preto,
 * e reduzir demais faz cada fio virar cinza escuro ao se misturar com o fundo —
 * a silhueta some antes de ser amostrada.
 */
const MASK_MAX = 560;

/** Luminância mínima (0–255) para o pixel contar como parte do desenho. */
const LUMA_THRESHOLD = 42;

interface Node {
  /** Posição normalizada 0..1 dentro da caixa da imagem. */
  readonly x: number;
  readonly y: number;
  readonly phase: number;
  readonly amp: number;
}

/**
 * Amostra pontos por rejeição onde a imagem tem traço claro.
 *
 * A referência é branco sobre preto, então luminância separa desenho de fundo
 * sem precisar de canal alfa — funciona igual com JPG, WEBP ou PNG opaco.
 */
function sampleNodes(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  count: number,
): Node[] {
  const nodes: Node[] = [];
  let guard = 0;

  while (nodes.length < count && guard < count * 80) {
    guard += 1;
    const px = Math.floor(Math.random() * w);
    const py = Math.floor(Math.random() * h);
    const i = (py * w + px) * 4;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const a = data[i + 3] ?? 0;
    if (a < 128) continue;

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (luma < LUMA_THRESHOLD) continue;

    nodes.push({
      x: px / w,
      y: py / h,
      phase: Math.random() * Math.PI * 2,
      amp: 0.0012 + Math.random() * 0.0022,
    });
  }

  return nodes;
}

/** Liga cada nó aos vizinhos próximos, com teto de grau por nó. */
function buildLinks(nodes: readonly Node[]): Array<[number, number]> {
  const links: Array<[number, number]> = [];
  const degree = new Array<number>(nodes.length).fill(0);
  const r2 = LINK_RADIUS * LINK_RADIUS;

  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    if (!a) continue;
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      if (!b) continue;
      if ((degree[i] ?? 0) >= MAX_LINKS_PER_NODE) break;
      if ((degree[j] ?? 0) >= MAX_LINKS_PER_NODE) continue;

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (dx * dx + dy * dy > r2) continue;

      links.push([i, j]);
      degree[i] = (degree[i] ?? 0) + 1;
      degree[j] = (degree[j] ?? 0) + 1;
    }
  }

  return links;
}

interface HandsNetworkCanvasProps {
  readonly src?: string;
  /** Opacidade dos traços. Baixa serve de fundo; alta, de peça principal. */
  readonly intensity?: number;
  readonly className?: string;
}

/**
 * Malha de pontos que redesenha uma imagem de referência.
 *
 * A silhueta vem da própria imagem, não de um caminho desenhado à mão: qualquer
 * tentativa de traçar anatomia em código lê como forma abstrata. Os pontos são
 * amostrados por luminância uma única vez e as arestas calculadas sobre as
 * posições base — no quadro a quadro só a oscilação muda, porque recalcular
 * vizinhança seria O(n²) por frame.
 *
 * Se a imagem não carregar, o canvas fica vazio de propósito: fundo em branco é
 * melhor que um desenho errado no lugar de um certo.
 */
export function HandsNetworkCanvas({
  // `new Image()` é DOM puro: o `basePath` que o Next aplica sozinho em
  // `<Link>` e `next/image` não chega aqui, e sem o prefixo a imagem dá 404
  // quando o site vive num subcaminho.
  src = `${BASE_PATH}/hands.webp`,
  intensity = 1,
  className,
}: HandsNetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Em ref, não em dependência do efeito de desenho: mudar a intensidade não pode
  // reamostrar a malha, senão os pontos saltariam de lugar a cada ajuste. A
  // escrita fica num efeito próprio porque mutar ref durante o render quebra sob
  // render concorrente, em que o React pode reexecutar o corpo do componente.
  const intensityRef = useRef(intensity);
  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;
    let rafId = 0;
    let cleanupObservers: (() => void) | null = null;

    const image = new Image();
    image.decoding = 'async';

    image.onload = () => {
      if (cancelled) return;

      const ratio = image.naturalWidth / image.naturalHeight;
      const maskW = ratio >= 1 ? MASK_MAX : Math.round(MASK_MAX * ratio);
      const maskH = ratio >= 1 ? Math.round(MASK_MAX / ratio) : MASK_MAX;

      const mask = document.createElement('canvas');
      mask.width = maskW;
      mask.height = maskH;
      const maskCtx = mask.getContext('2d', { willReadFrequently: true });
      if (!maskCtx) return;
      maskCtx.drawImage(image, 0, 0, maskW, maskH);

      const data = maskCtx.getImageData(0, 0, maskW, maskH).data;
      const nodes = sampleNodes(data, maskW, maskH, NODE_COUNT);
      if (nodes.length < 2) return;
      const links = buildLinks(nodes);

      // Cor lida do tema: canvas não enxerga variável CSS.
      const readInk = () =>
        getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() ||
        '#0b0f17';
      let ink = readInk();

      let width = 0;
      let height = 0;
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();

      const sizeObserver = new ResizeObserver(resize);
      sizeObserver.observe(canvas);

      const themeObserver = new MutationObserver(() => {
        ink = readInk();
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      cleanupObservers = () => {
        sizeObserver.disconnect();
        themeObserver.disconnect();
      };

      const start = performance.now();

      const render = (now: number) => {
        if (cancelled) return;
        const t = reduceMotion ? 0 : (now - start) / 1000;
        ctx.clearRect(0, 0, width, height);

        // Cobre a área inteira preservando a proporção da imagem (object-cover).
        const scale = Math.max(width / ratio, height);
        const drawH = scale;
        const drawW = scale * ratio;
        const offsetX = (width - drawW) / 2;
        const offsetY = (height - drawH) / 2;

        const px = (n: Node) =>
          offsetX + (n.x + Math.sin(t * 0.6 + n.phase) * n.amp) * drawW;
        const py = (n: Node) =>
          offsetY + (n.y + Math.cos(t * 0.8 + n.phase) * n.amp) * drawH;

        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.42 * intensityRef.current;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        for (const [i, j] of links) {
          const a = nodes[i];
          const b = nodes[j];
          if (!a || !b) continue;
          ctx.moveTo(px(a), py(a));
          ctx.lineTo(px(b), py(b));
        }
        ctx.stroke();

        ctx.fillStyle = ink;
        ctx.globalAlpha = 0.7 * intensityRef.current;
        for (const n of nodes) {
          ctx.fillRect(px(n) - 0.55, py(n) - 0.55, 1.1, 1.1);
        }
        ctx.globalAlpha = 1;

        if (!reduceMotion) rafId = requestAnimationFrame(render);
      };

      rafId = requestAnimationFrame(render);
    };

    image.src = src;

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      cleanupObservers?.();
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className ?? ''}`}
    />
  );
}
