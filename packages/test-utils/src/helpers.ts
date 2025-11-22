/**
 * Test Helpers
 *
 * Utility functions for testing Chicago Forest Network components.
 */

import type { NodeId, PeerInfo, PeerAddress, NodeIdentity } from '@chicago-forest/shared-types';

/**
 * Generate a deterministic test node ID
 */
export function createTestNodeId(seed: number = 0): NodeId {
  const hex = seed.toString(16).padStart(32, '0');
  return `CFN-${hex}`;
}

/**
 * Generate a random test node ID
 */
export function createRandomNodeId(): NodeId {
  const hex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `CFN-${hex}`;
}

/**
 * Create a test peer address
 */
export function createTestPeerAddress(
  options: Partial<PeerAddress> = {}
): PeerAddress {
  return {
    protocol: options.protocol ?? 'tcp',
    host: options.host ?? '127.0.0.1',
    port: options.port ?? 8000 + Math.floor(Math.random() * 1000),
    path: options.path,
  };
}

/**
 * Create a test peer info object
 */
export function createTestPeerInfo(
  options: Partial<PeerInfo> & { nodeId?: NodeId } = {}
): PeerInfo {
  const nodeId = options.nodeId ?? createRandomNodeId();
  return {
    nodeId,
    publicKey: options.publicKey ?? nodeId.replace('CFN-', '') + '0'.repeat(32),
    addresses: options.addresses ?? [createTestPeerAddress()],
    lastSeen: options.lastSeen ?? Date.now(),
    reputation: options.reputation ?? 100,
    capabilities: options.capabilities ?? ['relay'],
    metadata: options.metadata ?? {},
  };
}

/**
 * Create a test node identity
 */
export function createTestNodeIdentity(seed: number = 0): NodeIdentity {
  const nodeId = createTestNodeId(seed);
  const keyBase = seed.toString(16).padStart(64, '0');

  return {
    nodeId,
    keyPair: {
      publicKey: keyBase,
      privateKey: keyBase.split('').reverse().join(''),
    },
    createdAt: Date.now(),
    version: 1,
  };
}

/**
 * Wait for a specified duration
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const start = Date.now();

  while (!(await condition())) {
    if (Date.now() - start > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
    await delay(interval);
  }
}

/**
 * Create a promise that can be resolved/rejected externally
 */
export function createDeferredPromise<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Generate a sequence of test node IDs
 */
export function createTestNodeIds(count: number): NodeId[] {
  return Array.from({ length: count }, (_, i) => createTestNodeId(i));
}

/**
 * Create a test peer map of connected peers
 */
export function createTestPeerMap(size: number): Map<NodeId, PeerInfo> {
  const network = new Map<NodeId, PeerInfo>();

  for (let i = 0; i < size; i++) {
    const peer = createTestPeerInfo({ nodeId: createTestNodeId(i) });
    network.set(peer.nodeId, peer);
  }

  return network;
}

/**
 * Measure execution time of an async function
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Run a function multiple times and collect results
 */
export async function runTimes<T>(
  fn: (index: number) => Promise<T>,
  count: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < count; i++) {
    results.push(await fn(i));
  }
  return results;
}

/**
 * Collect events from an EventEmitter during execution
 */
export function collectEvents<T extends Record<string, (...args: unknown[]) => void>>(
  emitter: { on: (event: string, handler: (...args: unknown[]) => void) => void },
  eventNames: string[]
): {
  events: Array<{ name: string; args: unknown[] }>;
  stop: () => void;
} {
  const events: Array<{ name: string; args: unknown[] }> = [];
  const handlers: Array<{ name: string; handler: (...args: unknown[]) => void }> = [];

  for (const name of eventNames) {
    const handler = (...args: unknown[]) => {
      events.push({ name, args });
    };
    emitter.on(name, handler);
    handlers.push({ name, handler });
  }

  return {
    events,
    stop: () => {
      // Note: EventEmitter3 uses 'off' or 'removeListener'
      // This is a simplified version
    },
  };
}

/**
 * Create a spy function that tracks calls
 */
export function createSpy<T extends (...args: any[]) => any>(
  implementation?: T
): T & {
  calls: Array<{ args: Parameters<T>; returnValue: ReturnType<T> }>;
  callCount: number;
  reset: () => void;
} {
  const calls: Array<{ args: Parameters<T>; returnValue: ReturnType<T> }> = [];

  const spy = function (...args: Parameters<T>): ReturnType<T> {
    const returnValue = (implementation
      ? implementation(...args)
      : undefined) as ReturnType<T>;
    calls.push({ args, returnValue: returnValue as ReturnType<T> });
    return returnValue;
  } as T & {
    calls: Array<{ args: Parameters<T>; returnValue: ReturnType<T> }>;
    callCount: number;
    reset: () => void;
  };

  Object.defineProperty(spy, 'calls', { get: () => calls });
  Object.defineProperty(spy, 'callCount', { get: () => calls.length });
  spy.reset = () => { calls.length = 0; };

  return spy;
}

/**
 * Assert that a function throws a specific error
 */
export async function expectThrows(
  fn: () => Promise<unknown>,
  errorMatch?: string | RegExp
): Promise<Error> {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw if this is our own "expected function to throw" error
      if (error.message === 'Expected function to throw') {
        throw error;
      }
      if (errorMatch) {
        if (typeof errorMatch === 'string') {
          if (!error.message.includes(errorMatch)) {
            throw new Error(
              `Expected error message to include "${errorMatch}" but got "${error.message}"`
            );
          }
        } else if (!errorMatch.test(error.message)) {
          throw new Error(
            `Expected error message to match ${errorMatch} but got "${error.message}"`
          );
        }
      }
      return error;
    }
    throw error;
  }
}
