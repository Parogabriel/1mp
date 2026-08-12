import type { Metadata } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import { APP_URL } from '@/config';
import '@/presentation/styles/globals.css';
import { SmoothScrollProvider } from '@/presentation/providers/SmoothScrollProvider';
import { ToastProvider } from '@/presentation/components/ui/Toast';

const fraunces = Fraunces({
  subsets: ['latin'],
  // `axes` só é aceito sem lista de pesos — e é o eixo óptico que afina o
  // contraste nos corpos grandes do hero.
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
  // Sem `metadataBase` o Next avisa no build ao resolver Open Graph relativo.
  metadataBase: new URL(APP_URL),
  title: '1MP — One Million Posts',
  description:
    'Marcas e criadores negociam campanhas vendo alcance, impressões e retorno projetados.',
};

/** Casca de roteamento: o App Router exige `src/app`, a UI vive em `src/presentation`. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="brutalist"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable}`}
    >
      <body>
        <ToastProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
