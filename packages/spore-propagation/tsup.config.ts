import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'spore/index': 'src/spore/index.ts',
    'distribution/index': 'src/distribution/index.ts',
    'germination/index': 'src/germination/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
});
