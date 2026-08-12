import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * A dependência entre as camadas aponta só para dentro: o domínio não conhece
 * ninguém, e quem está fora é que o importa. A regra abaixo impede que isso
 * pare de valer sem alguém notar.
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

  // Flat config nativo. O `FlatCompat` do @eslint/eslintrc não serve a partir do
  // eslint-config-next 16: o pacote passou a exportar array de flat config, e
  // passá-lo pelo shim estoura com referência circular em `property 'react'`.
  ...nextCoreWebVitals,
  ...nextTypescript,

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
