import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/gun/index.ts',
    'src/orbitdb/index.ts',
    'src/crdt/index.ts',
    'src/adapters/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['gun', '@orbitdb/core', 'helia'],
});
