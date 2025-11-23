import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'validators/index': 'src/validators/index.ts',
    'scanners/index': 'src/scanners/index.ts',
    'classifiers/index': 'src/classifiers/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2022',
  treeshake: true,
  minify: false,
  external: ['@chicago-forest/shared-types', '@chicago-forest/content-generator'],
});
