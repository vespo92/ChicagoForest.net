import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'rest/index': 'src/rest/index.ts',
    'websocket/index': 'src/websocket/index.ts',
    'sdk/index': 'src/sdk/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
});
