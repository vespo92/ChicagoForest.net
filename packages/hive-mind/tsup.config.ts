import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'consensus/index': 'src/consensus/index.ts',
    'governance/index': 'src/governance/index.ts',
    'proposals/index': 'src/proposals/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
});
