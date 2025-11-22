/**
 * Vitest Configuration
 *
 * Chicago Forest Network - Base Test Configuration
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/index.ts', // Re-exports
        '**/*.test.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-reports/index.html',
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    retry: 1,
    sequence: {
      shuffle: true,
    },
  },
  resolve: {
    alias: {
      '@chicago-forest/test-utils': './packages/test-utils/src',
      '@chicago-forest/mycelium-core': './packages/mycelium-core/src',
      '@chicago-forest/p2p-core': './packages/p2p-core/src',
      '@chicago-forest/routing': './packages/routing/src',
      '@chicago-forest/shared-types': './packages/shared-types/src',
    },
  },
});
