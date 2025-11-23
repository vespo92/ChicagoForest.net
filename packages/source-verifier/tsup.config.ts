import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    'validators/index': 'src/validators/index.ts',
    'checkers/index': 'src/checkers/index.ts',
    'reporters/index': 'src/reporters/index.ts',
    'monitoring/index': 'src/monitoring/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  external: ['eventemitter3'],
});
