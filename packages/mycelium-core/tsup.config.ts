import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'hyphal/index': 'src/hyphal/index.ts',
    'signal/index': 'src/signal/index.ts',
    'topology/index': 'src/topology/index.ts',
    'growth/index': 'src/growth/index.ts',
    'clustering/index': 'src/clustering/index.ts',
    'pathfinding/index': 'src/pathfinding/index.ts',
    'metrics/index': 'src/metrics/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
});
