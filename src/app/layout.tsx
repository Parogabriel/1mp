import type { Metadata } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import { env } from '@/env';
import '@/presentation/styles/globals.css';
import { SmoothScrollProvider } from '@/presentation/providers/SmoothScrollProvider';

/**
 * Serifada nos títulos: dá o tom editorial que uma geométrica sem serifa não
 * alcança. O eixo `opsz` afina o contraste nos corpos grandes do hero, que é o
 * que separa "elegante" de "pesada".
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  // Sem lista de pesos: `axes` só é aceito na variável completa, e é o eixo
  // óptico que dá o refinamento. Toda a faixa 100–900 fica disponível.
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  // Sem `metadataBase`, o Next resolve URLs relativas de Open Graph contra
  // localhost e avisa no build. Com ela, a variável de ambiente deixa de ser
  // decorativa: se vier malformada, o build para em vez de gerar link quebrado.
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: '1MP — One Million Posts',
  description:
    'Marcas e criadores negociam campanhas vendo alcance, impressões e retorno projetados.',
};

/**
 * Camada de roteamento. O App Router exige `src/app`; a UI real vive em
 * `src/presentation`. Estes arquivos são cascas finas de propósito — qualquer
 * lógica aqui viola a separação de camadas.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="brutalist"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable}`}
    >
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
