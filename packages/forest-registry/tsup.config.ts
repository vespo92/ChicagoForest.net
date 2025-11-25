import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'records/index': 'src/records/index.ts',
    'resolver/index': 'src/resolver/index.ts',
    'replication/index': 'src/replication/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
});
