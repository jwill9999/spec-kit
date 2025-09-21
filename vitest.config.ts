import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'json-summary', 'lcov'],
      exclude: [
        'bin/**',
        'docs/**',
        'scripts/**',
        'node_modules/**',
        'coverage/**',
        'tests/**',
        'tmp-*/**',
      ],
    },
    include: ['tests/**/*.spec.{js,ts}'],
  },
});
