import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'hyphal/index': 'src/hyphal/index.ts',
    'signal/index': 'src/signal/index.ts',
    'topology/index': 'src/topology/index.ts',
    'growth/index': 'src/growth/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
});
