import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/api/**/*.test.ts'], environment: 'node', coverage: { reporter: ['text'] } }
});
