import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'resources/index': 'src/resources/index.ts',
    'credits/index': 'src/credits/index.ts',
    'exchange/index': 'src/exchange/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
});
