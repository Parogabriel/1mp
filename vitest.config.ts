import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Só o núcleo por enquanto: domínio e infraestrutura são lógica pura, sem I/O
 * nem DOM, então rodam em `node` sem jsdom e sem setup de React.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/domain/**/*.test.ts', 'src/infrastructure/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
