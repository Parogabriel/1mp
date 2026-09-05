import type { NextConfig } from 'next';
import { BASE_PATH } from './src/config';

/**
 * Cabeçalhos de segurança aplicados a todas as rotas.
 *
 * Valem no `next dev` e no `next start`, onde existe um servidor Next para
 * emiti-los. A publicação no GitHub Pages é de arquivos estáticos servidos por
 * um CDN que não aceita cabeçalho customizado, então lá eles não existem — por
 * isso o bloco abaixo sai da configuração quando o alvo é o Pages, em vez de
 * ficar declarado dando a impressão de proteger algo.
 */
const cabecalhosDeSeguranca = [
  // Impede o navegador de adivinhar o tipo do conteúdo. Sem isso, um arquivo
  // enviado por usuário e servido como texto pode ser interpretado como script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Clickjacking: ninguém embute o 1MP num iframe.
  { key: 'X-Frame-Options', value: 'DENY' },

  // Equivalente moderno do X-Frame-Options. Os dois convivem porque navegadores
  // antigos ignoram frame-ancestors e os novos ignoram X-Frame-Options.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },

  // Envia a URL completa como referrer só na mesma origem; para fora, apenas o
  // domínio. Evita vazar caminho e query string de dashboard para terceiros.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Dois anos de HTTPS obrigatório, subdomínios incluídos. Navegadores ignoram
  // este cabeçalho quando a origem não é segura, então não atrapalha o
  // desenvolvimento em localhost.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },

  // Desliga APIs sensíveis que a aplicação não usa. Se um script de terceiro
  // entrar no bundle, ele já chega sem acesso a câmera, microfone ou posição.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
];

const paraGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  // O padrão anuncia "X-Powered-By: Next.js" em toda resposta. Informar a
  // versão do framework não protege ninguém e ajuda quem procura alvo.
  poweredByHeader: false,

  ...(paraGitHubPages
    ? {
        // O Pages serve arquivo, não roda Node: o build precisa virar HTML
        // pronto em `out/`. Só é possível porque nenhuma rota depende de
        // servidor — não há API route, server action nem rota dinâmica.
        output: 'export' as const,

        // Sem isto o Next só publica `/sobre`; o Pages procura `/sobre/` e
        // devolve 404 em quem chegar pelo link com barra no fim.
        trailingSlash: true,

        basePath: BASE_PATH,
      }
    : {
        async headers() {
          return [{ source: '/:path*', headers: cabecalhosDeSeguranca }];
        },
      }),
};

export default nextConfig;
