import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    node: 'src/node.ts',
    'transport-adapter': 'src/transport-adapter.ts',
    discovery: 'src/discovery.ts',
    pubsub: 'src/pubsub.ts',
    protocols: 'src/protocols.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['@chicago-forest/p2p-core', '@chicago-forest/shared-types'],
});
