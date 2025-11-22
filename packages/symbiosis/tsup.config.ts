import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'gateway/index': 'src/gateway/index.ts',
    'federation/index': 'src/federation/index.ts',
    'bridge/index': 'src/bridge/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
});
