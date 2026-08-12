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
 * URL absoluta do site, usada pelo `metadataBase` para resolver Open Graph.
 *
 * Aponta para localhost porque é onde a aplicação roda hoje. Ao publicar,
 * troque aqui — é o único lugar.
 */
export const APP_URL = 'http://localhost:3000';
