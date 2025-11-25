import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'identity/index': 'src/identity/index.ts',
    'discovery/index': 'src/discovery/index.ts',
    'connection/index': 'src/connection/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
