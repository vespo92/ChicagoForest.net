/**
 * tsup Build Configuration
 * Agent 17: Ambassador - Community Manager
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'triage/index': 'src/triage/index.ts',
    'onboarding/index': 'src/onboarding/index.ts',
    'metrics/index': 'src/metrics/index.ts',
    'newsletter/index': 'src/newsletter/index.ts',
    'discussions/index': 'src/discussions/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
});
