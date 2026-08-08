import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/**
 * A dependência entre as camadas aponta só para dentro: o domínio não conhece
 * ninguém, e quem está fora é que o importa. Hoje o código respeita isso por
 * disciplina; a regra abaixo impede que pare de respeitar sem alguém notar.
 *
 * Os padrões são casados contra a string do import, então cobrem tanto o alias
 * (`@/application/...`) quanto o caminho relativo (`../application/...`).
 */
const camadasProibidasNoDominio = ['application', 'infrastructure', 'presentation', 'app'].flatMap(
  (camada) => [`**/${camada}`, `**/${camada}/**`],
);

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: camadasProibidasNoDominio,
              message:
                'O domínio não pode depender de application, infrastructure, presentation ou app. Inverta a dependência: quem precisa do domínio é que o importa.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
