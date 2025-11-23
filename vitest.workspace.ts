/**
 * Vitest Workspace Configuration
 *
 * Chicago Forest Network - Unified Test Suite
 *
 * This workspace configuration enables running tests across all packages
 * with shared configuration and parallel execution.
 */

import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'mycelium-core',
      root: './packages/mycelium-core',
      include: ['tests/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'p2p-core',
      root: './packages/p2p-core',
      include: ['tests/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'routing',
      root: './packages/routing',
      include: ['tests/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'test-utils',
      root: './packages/test-utils',
      include: ['tests/**/*.test.ts', 'tests/**/*.integration.test.ts'],
      environment: 'node',
    },
  },
]);
