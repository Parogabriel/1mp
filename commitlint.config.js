/**
 * Conventional Commits com escopo fechado nas camadas do projeto.
 *
 * O escopo fechado não é burocracia: ele é o que permite ler `git log` por
 * camada e perceber, por exemplo, que uma mudança marcada como `ui` mexeu em
 * `domain`. Escopo livre vira sinônimo solto — "store", "stores", "state" — e
 * o histórico perde a capacidade de ser filtrado.
 *
 * O tipo e o escopo ficam em inglês, como a especificação exige. O assunto é
 * em português, acompanhando o resto do projeto.
 */

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'domain', // regras de negócio puras, sem dependência de framework
        'app', // rotas do App Router
        'infra', // adaptadores e serviços externos
        'ui', // componentes, telas e estilos
        'store', // estado de aplicação (zustand)
        'config', // build, lint, tipos, ferramentas
        'ci', // pipelines
        'deps', // atualização de dependências
      ],
    ],

    // O assunto é escrito em português e carrega nomes próprios com maiúscula
    // no meio ("Next.js", "TypeScript", "ROI"). A checagem de caixa padrão
    // trata isso como erro de estilo, e não é.
    'subject-case': [0],
  },
};
