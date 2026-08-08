import { z } from 'zod';

/**
 * Validação das variáveis de ambiente, em dois schemas separados.
 *
 * A separação não é organizacional, é de segurança: tudo que está no schema de
 * cliente é embutido no bundle e fica visível para qualquer visitante. Manter
 * os dois no mesmo objeto é como um segredo de servidor vaza para o navegador
 * sem ninguém perceber — basta alguém acrescentar uma chave no lugar errado.
 *
 * ## Por que os valores de cliente são escritos um a um
 *
 * O Next.js não entrega `process.env` ao navegador. Ele faz substituição
 * textual em tempo de build: cada ocorrência literal de
 * `process.env.NEXT_PUBLIC_ALGO` no código vira o valor correspondente. Uma
 * leitura dinâmica — `process.env[chave]` — não é substituída e chega
 * `undefined` em produção, com a validação passando em desenvolvimento e
 * quebrando depois do deploy. Por isso o objeto abaixo é literal e precisa
 * ganhar uma linha nova a cada variável pública.
 *
 * ## Como adicionar uma variável
 *
 * 1. Declare no schema correspondente (servidor ou cliente).
 * 2. Se for de cliente, acrescente a linha literal em `valoresDoCliente`.
 * 3. Documente em `.env.example` — sem valor real.
 * 4. Se o CI precisar dela para buildar, acrescente em `.github/workflows/ci.yml`.
 */

const schemaDoServidor = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const schemaDoCliente = z.object({
  NEXT_PUBLIC_APP_URL: z.url({
    message: 'precisa ser uma URL absoluta, com protocolo (ex.: http://localhost:3000)',
  }),
});

/**
 * Espelho literal do schema de cliente. Ver a explicação sobre substituição
 * textual acima antes de trocar isto por algo mais esperto.
 */
const valoresDoCliente = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

function validar<T extends z.ZodType>(schema: T, valores: unknown, escopo: string): z.infer<T> {
  const resultado = schema.safeParse(valores);

  if (!resultado.success) {
    const detalhes = resultado.error.issues
      .map((problema) => `  • ${problema.path.join('.') || '(raiz)'}: ${problema.message}`)
      .join('\n');

    throw new Error(
      `Variáveis de ambiente inválidas (${escopo}):\n${detalhes}\n\n` +
        'Copie .env.example para .env.local e preencha os valores.',
    );
  }

  return resultado.data;
}

/**
 * Ambiente público, seguro em qualquer lugar. Validado na importação: um valor
 * malformado derruba o build, que é onde se quer descobrir o problema — e não
 * numa requisição em produção.
 */
export const env = validar(schemaDoCliente, valoresDoCliente, 'cliente');

let cacheDoServidor: z.infer<typeof schemaDoServidor> | null = null;

/**
 * Ambiente de servidor. É função, e não constante, de propósito: uma constante
 * validada na importação rodaria também no navegador quando um componente de
 * cliente importasse este módulo — e lá as variáveis de servidor não existem,
 * então a validação falharia sem motivo real.
 *
 * @throws se chamado a partir do navegador.
 */
export function envDoServidor(): z.infer<typeof schemaDoServidor> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'envDoServidor() foi chamado no navegador. Variáveis de servidor não são ' +
        'enviadas ao cliente; use `env` para as públicas.',
    );
  }

  cacheDoServidor ??= validar(schemaDoServidor, process.env, 'servidor');
  return cacheDoServidor;
}
