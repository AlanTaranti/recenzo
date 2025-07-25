import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '~': '/src',
    },
  },
  test: {
    dir: 'test',
    coverage: {
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
