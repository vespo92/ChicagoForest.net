import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'crypto/index': 'src/crypto/index.ts',
    'threat/index': 'src/threat/index.ts',
    'audit/index': 'src/audit/index.ts',
    'privacy/index': 'src/privacy/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    '@chicago-forest/shared-types',
    '@chicago-forest/p2p-core',
  ],
});
