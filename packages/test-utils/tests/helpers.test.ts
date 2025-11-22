/**
 * Test Utilities - Self Tests
 *
 * Tests to verify the test utilities work correctly.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createTestNodeId,
  createRandomNodeId,
  createTestPeerAddress,
  createTestPeerInfo,
  createTestNodeIdentity,
  delay,
  waitFor,
  createDeferredPromise,
  createTestNodeIds,
  createTestPeerMap,
  measureTime,
  runTimes,
  createSpy,
  expectThrows,
} from '../src/helpers';

describe('createTestNodeId', () => {
  it('should create deterministic node ID from seed', () => {
    const id1 = createTestNodeId(1);
    const id2 = createTestNodeId(1);

    expect(id1).toBe(id2);
    expect(id1).toMatch(/^CFN-[0-9a-f]{32}$/);
  });

  it('should create different IDs for different seeds', () => {
    const id1 = createTestNodeId(1);
    const id2 = createTestNodeId(2);

    expect(id1).not.toBe(id2);
  });
});

describe('createRandomNodeId', () => {
  it('should create valid node ID', () => {
    const id = createRandomNodeId();
    expect(id).toMatch(/^CFN-[0-9a-f]{32}$/);
  });

  it('should create unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(createRandomNodeId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('createTestPeerAddress', () => {
  it('should create default address', () => {
    const addr = createTestPeerAddress();

    expect(addr.protocol).toBe('tcp');
    expect(addr.host).toBe('127.0.0.1');
    expect(typeof addr.port).toBe('number');
  });

  it('should allow overrides', () => {
    const addr = createTestPeerAddress({
      protocol: 'ws',
      host: '192.168.1.1',
      port: 9000,
      path: '/socket',
    });

    expect(addr.protocol).toBe('ws');
    expect(addr.host).toBe('192.168.1.1');
    expect(addr.port).toBe(9000);
    expect(addr.path).toBe('/socket');
  });
});

describe('createTestPeerInfo', () => {
  it('should create valid peer info', () => {
    const peer = createTestPeerInfo();

    expect(peer.nodeId).toMatch(/^CFN-/);
    expect(peer.publicKey).toBeDefined();
    expect(peer.addresses).toHaveLength(1);
    expect(peer.reputation).toBe(100);
    expect(peer.capabilities).toEqual(['relay']);
  });

  it('should use provided node ID', () => {
    const nodeId = createTestNodeId(42);
    const peer = createTestPeerInfo({ nodeId });

    expect(peer.nodeId).toBe(nodeId);
  });
});

describe('createTestNodeIdentity', () => {
  it('should create valid identity', () => {
    const identity = createTestNodeIdentity(1);

    expect(identity.nodeId).toBe(createTestNodeId(1));
    expect(identity.keyPair.publicKey).toBeDefined();
    expect(identity.keyPair.privateKey).toBeDefined();
    expect(identity.version).toBe(1);
  });
});

describe('delay', () => {
  it('should delay for specified time', async () => {
    vi.useFakeTimers();

    const delayPromise = delay(100);
    vi.advanceTimersByTime(100);

    await expect(delayPromise).resolves.toBeUndefined();

    vi.useRealTimers();
  });
});

describe('waitFor', () => {
  it('should resolve when condition becomes true', async () => {
    let value = false;
    setTimeout(() => { value = true; }, 20);

    await expect(waitFor(() => value, { timeout: 1000, interval: 10 })).resolves.toBeUndefined();
  });

  it('should reject on timeout', async () => {
    await expect(waitFor(() => false, { timeout: 50, interval: 10 }))
      .rejects.toThrow('Condition not met within 50ms');
  });
});

describe('createDeferredPromise', () => {
  it('should allow external resolution', async () => {
    const { promise, resolve } = createDeferredPromise<number>();

    resolve(42);

    await expect(promise).resolves.toBe(42);
  });

  it('should allow external rejection', async () => {
    const { promise, reject } = createDeferredPromise<number>();

    reject(new Error('Test error'));

    await expect(promise).rejects.toThrow('Test error');
  });
});

describe('createTestNodeIds', () => {
  it('should create specified number of IDs', () => {
    const ids = createTestNodeIds(5);

    expect(ids).toHaveLength(5);
    ids.forEach((id, i) => {
      expect(id).toBe(createTestNodeId(i));
    });
  });
});

describe('createTestPeerMap', () => {
  it('should create network with specified size', () => {
    const network = createTestPeerMap(10);

    expect(network.size).toBe(10);
  });

  it('should have consistent node IDs as keys', () => {
    const network = createTestPeerMap(5);

    for (let i = 0; i < 5; i++) {
      const nodeId = createTestNodeId(i);
      expect(network.has(nodeId)).toBe(true);
      expect(network.get(nodeId)?.nodeId).toBe(nodeId);
    }
  });
});

describe('measureTime', () => {
  it('should measure async function execution', async () => {
    vi.useFakeTimers();

    const asyncFn = async () => {
      await delay(100);
      return 'result';
    };

    const measurePromise = measureTime(asyncFn);
    vi.advanceTimersByTime(100);

    const { result, duration } = await measurePromise;

    expect(result).toBe('result');
    expect(duration).toBeGreaterThanOrEqual(0);

    vi.useRealTimers();
  });
});

describe('runTimes', () => {
  it('should run function multiple times', async () => {
    let callCount = 0;
    const results = await runTimes(async (i) => {
      callCount++;
      return i * 2;
    }, 5);

    expect(callCount).toBe(5);
    expect(results).toEqual([0, 2, 4, 6, 8]);
  });
});

describe('createSpy', () => {
  it('should track calls', () => {
    const spy = createSpy((x: number) => x * 2);

    spy(1);
    spy(2);
    spy(3);

    expect(spy.callCount).toBe(3);
    expect(spy.calls).toHaveLength(3);
    expect(spy.calls[0].args).toEqual([1]);
    expect(spy.calls[0].returnValue).toBe(2);
  });

  it('should work without implementation', () => {
    const spy = createSpy();

    spy('arg1', 'arg2');

    expect(spy.callCount).toBe(1);
    expect(spy.calls[0].args).toEqual(['arg1', 'arg2']);
    expect(spy.calls[0].returnValue).toBeUndefined();
  });

  it('should reset calls', () => {
    const spy = createSpy();

    spy(1);
    spy(2);
    expect(spy.callCount).toBe(2);

    spy.reset();
    expect(spy.callCount).toBe(0);
    expect(spy.calls).toHaveLength(0);
  });
});

describe('expectThrows', () => {
  it('should catch expected error', async () => {
    const error = await expectThrows(async () => {
      throw new Error('Test error');
    });

    expect(error.message).toBe('Test error');
  });

  it('should match error message string', async () => {
    await expectThrows(async () => {
      throw new Error('This is a test error message');
    }, 'test error');
  });

  it('should match error message regex', async () => {
    await expectThrows(async () => {
      throw new Error('Error code: 404');
    }, /code: \d+/);
  });

  it('should fail if no error thrown', async () => {
    await expect(expectThrows(async () => 'no error'))
      .rejects.toThrow('Expected function to throw');
  });

  it('should fail if message does not match', async () => {
    await expect(expectThrows(async () => {
      throw new Error('Different error');
    }, 'Expected message'))
      .rejects.toThrow('Expected error message to include');
  });
});
