import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    benchmarks: 'src/benchmarks/index.ts',
    profilers: 'src/profilers/index.ts',
    reporters: 'src/reporters/index.ts',
    load: 'src/load/index.ts',
    latency: 'src/latency/index.ts',
    baseline: 'src/baseline/index.ts',
    gates: 'src/gates/index.ts',
    utils: 'src/utils/index.ts',
    types: 'src/types.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [
    '@chicago-forest/shared-types',
    '@chicago-forest/mycelium-core',
    '@chicago-forest/p2p-core',
    '@chicago-forest/canopy-api',
  ],
});
