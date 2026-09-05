/**
 * Configuração pública da aplicação.
 *
 * Substituiu um schema de validação de ambiente que existia para conferir uma
 * única constante. Sem segredo de servidor e sem valor que mude por deploy, o
 * `.env` só adicionava um passo entre clonar o repositório e ver o site.
 *
 * Se um backend entrar depois — banco, Stripe, provedor de e-mail — a validação
 * volta, e aí com função: segredo de servidor precisa falhar alto no build, não
 * virar `undefined` em produção.
 */

/**
 * Ligado só pelo workflow de deploy. O GitHub Pages serve este projeto em
 * `parogabriel.github.io/1mp` — um subcaminho, não a raiz de um domínio —, e é
 * a única diferença real entre rodar aqui e rodar publicado.
 */
const paraGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';

/**
 * Prefixo de caminho do site publicado, vazio em desenvolvimento.
 *
 * O `<Link>` e o `next/navigation` já aplicam o `basePath` sozinhos; quem
 * precisa desta constante é o código que monta URL de asset na mão, fora do
 * alcance do Next — `new Image()`, `fetch` de arquivo em `public/`.
 */
export const BASE_PATH = paraGitHubPages ? '/1mp' : '';

/** URL absoluta do site, usada pelo `metadataBase` para resolver Open Graph. */
export const APP_URL = paraGitHubPages
  ? 'https://parogabriel.github.io/1mp'
  : 'http://localhost:3000';
