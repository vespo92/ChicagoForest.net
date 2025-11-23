/**
 * Benchmark Definitions
 *
 * Pre-defined benchmarks for common operations.
 */

export interface BenchmarkDefinition {
  name: string;
  description: string;
  category: 'network' | 'crypto' | 'data' | 'api';
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  run: () => void | Promise<void>;
}

export const networkBenchmarks: BenchmarkDefinition[] = [
  {
    name: 'peer-discovery',
    description: 'Time to discover N peers in the network',
    category: 'network',
    run: async () => {
      // Simulated peer discovery
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    },
  },
  {
    name: 'message-routing',
    description: 'Time to route a message through the mesh',
    category: 'network',
    run: async () => {
      // Simulated message routing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
    },
  },
  {
    name: 'topology-update',
    description: 'Time to update network topology',
    category: 'network',
    run: async () => {
      // Simulated topology update
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2));
    },
  },
];

export const cryptoBenchmarks: BenchmarkDefinition[] = [
  {
    name: 'key-generation',
    description: 'Time to generate a new key pair',
    category: 'crypto',
    run: () => {
      // Simulated key generation
      const arr = new Uint8Array(32);
      for (let i = 0; i < 32; i++) arr[i] = Math.random() * 256;
    },
  },
  {
    name: 'message-encryption',
    description: 'Time to encrypt a 1KB message',
    category: 'crypto',
    run: () => {
      // Simulated encryption
      const data = new Uint8Array(1024);
      for (let i = 0; i < 1024; i++) data[i] = data[i] ^ 0x42;
    },
  },
  {
    name: 'signature-verification',
    description: 'Time to verify a digital signature',
    category: 'crypto',
    run: () => {
      // Simulated verification
      let sum = 0;
      for (let i = 0; i < 100; i++) sum += Math.random();
    },
  },
];

export const dataBenchmarks: BenchmarkDefinition[] = [
  {
    name: 'data-serialization',
    description: 'Time to serialize a complex object',
    category: 'data',
    run: () => {
      const obj = { a: 1, b: [1, 2, 3], c: { nested: true } };
      JSON.stringify(obj);
    },
  },
  {
    name: 'data-deserialization',
    description: 'Time to deserialize a JSON string',
    category: 'data',
    run: () => {
      const str = '{"a":1,"b":[1,2,3],"c":{"nested":true}}';
      JSON.parse(str);
    },
  },
  {
    name: 'conflict-resolution',
    description: 'Time to resolve a data conflict',
    category: 'data',
    run: () => {
      const a = { timestamp: Date.now(), value: 'a' };
      const b = { timestamp: Date.now() + 1, value: 'b' };
      a.timestamp > b.timestamp ? a : b;
    },
  },
];

export const apiBenchmarks: BenchmarkDefinition[] = [
  {
    name: 'api-request-parsing',
    description: 'Time to parse an API request',
    category: 'api',
    run: () => {
      const request = {
        method: 'POST',
        path: '/api/v1/nodes',
        body: JSON.stringify({ nodeId: 'test', data: [1, 2, 3] }),
      };
      JSON.parse(request.body);
    },
  },
  {
    name: 'api-response-building',
    description: 'Time to build an API response',
    category: 'api',
    run: () => {
      const response = {
        status: 200,
        data: { success: true, result: { id: 'test', created: new Date() } },
      };
      JSON.stringify(response);
    },
  },
];

export function getAllBenchmarks(): BenchmarkDefinition[] {
  return [
    ...networkBenchmarks,
    ...cryptoBenchmarks,
    ...dataBenchmarks,
    ...apiBenchmarks,
  ];
}

export function getBenchmarksByCategory(category: BenchmarkDefinition['category']): BenchmarkDefinition[] {
  return getAllBenchmarks().filter(b => b.category === category);
}
