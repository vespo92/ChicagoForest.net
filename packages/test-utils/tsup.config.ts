import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'mocks/index': 'src/mocks/index.ts',
    'fixtures/index': 'src/fixtures/index.ts',
    helpers: 'src/helpers.ts',
  },
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['vitest', 'eventemitter3'],
});
