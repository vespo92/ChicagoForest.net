import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'validators/index': 'src/validators/index.ts',
    'checkers/index': 'src/checkers/index.ts',
    'generators/index': 'src/generators/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['vitest', 'eventemitter3'],
});
