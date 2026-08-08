import type { NextConfig } from 'next';

/**
 * Cabeçalhos de segurança aplicados a todas as rotas.
 *
 * Nenhum deles depende de configuração no provedor de hospedagem: viajam com a
 * resposta, então valem igualmente em produção, em preview e no `next start`
 * local. É a diferença entre uma proteção que existe e uma que alguém precisa
 * lembrar de ligar.
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

const nextConfig: NextConfig = {
  // O padrão anuncia "X-Powered-By: Next.js" em toda resposta. Informar a
  // versão do framework não protege ninguém e ajuda quem procura alvo.
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: cabecalhosDeSeguranca }];
  },
};

export default nextConfig;
