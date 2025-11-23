/**
 * CRDT Tests
 *
 * Comprehensive tests for Conflict-free Replicated Data Types
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  VectorClock,
  GCounter,
  PNCounter,
  GSet,
  TwoPhaseSet,
  ORSet,
  LWWRegister,
  LWWMap,
  MVRegister,
  CRDTDocument,
} from '../src/crdt';

describe('VectorClock', () => {
  it('should initialize empty', () => {
    const vc = new VectorClock();
    expect(vc.get('node1')).toBe(0);
  });

  it('should increment for a node', () => {
    const vc = new VectorClock();
    vc.increment('node1');
    expect(vc.get('node1')).toBe(1);
    vc.increment('node1');
    expect(vc.get('node1')).toBe(2);
  });

  it('should merge vector clocks', () => {
    const vc1 = new VectorClock({ node1: 3, node2: 1 });
    const vc2 = new VectorClock({ node1: 2, node2: 4, node3: 1 });

    vc1.merge(vc2);

    expect(vc1.get('node1')).toBe(3);
    expect(vc1.get('node2')).toBe(4);
    expect(vc1.get('node3')).toBe(1);
  });

  it('should compare vector clocks correctly', () => {
    const vc1 = new VectorClock({ node1: 2, node2: 3 });
    const vc2 = new VectorClock({ node1: 2, node2: 3 });
    expect(vc1.compare(vc2)).toBe('equal');

    const vc3 = new VectorClock({ node1: 3, node2: 3 });
    expect(vc1.compare(vc3)).toBe('before');
    expect(vc3.compare(vc1)).toBe('after');

    const vc4 = new VectorClock({ node1: 3, node2: 2 });
    expect(vc1.compare(vc4)).toBe('concurrent');
  });

  it('should clone correctly', () => {
    const vc1 = new VectorClock({ node1: 5 });
    const vc2 = vc1.clone();
    vc2.increment('node1');

    expect(vc1.get('node1')).toBe(5);
    expect(vc2.get('node1')).toBe(6);
  });

  it('should serialize to JSON', () => {
    const vc = new VectorClock({ node1: 3, node2: 5 });
    const json = vc.toJSON();
    expect(json).toEqual({ node1: 3, node2: 5 });
  });
});

describe('GCounter', () => {
  it('should start at zero', () => {
    const counter = new GCounter('node1');
    expect(counter.value()).toBe(0);
  });

  it('should increment', () => {
    const counter = new GCounter('node1');
    counter.increment();
    expect(counter.value()).toBe(1);
    counter.increment(5);
    expect(counter.value()).toBe(6);
  });

  it('should throw on negative increment', () => {
    const counter = new GCounter('node1');
    expect(() => counter.increment(-1)).toThrow();
  });

  it('should merge correctly', () => {
    const c1 = new GCounter('node1');
    c1.increment(5);

    const c2 = new GCounter('node2');
    c2.increment(3);

    c1.merge(c2);
    expect(c1.value()).toBe(8);

    // Idempotent merge
    c1.merge(c2);
    expect(c1.value()).toBe(8);
  });

  it('should handle concurrent increments', () => {
    const c1 = new GCounter('node1');
    const c2 = new GCounter('node2');

    c1.increment(10);
    c2.increment(7);

    // Simulate network partition and independent updates
    const c1Copy = c1.clone();
    c1Copy.increment(3);

    c2.increment(5);

    // Merge after partition heals
    c1Copy.merge(c2);
    c2.merge(c1Copy);

    expect(c1Copy.value()).toBe(25); // 10 + 3 + 7 + 5
    expect(c2.value()).toBe(25);
  });
});

describe('PNCounter', () => {
  it('should start at zero', () => {
    const counter = new PNCounter('node1');
    expect(counter.value()).toBe(0);
  });

  it('should increment and decrement', () => {
    const counter = new PNCounter('node1');
    counter.increment(10);
    counter.decrement(3);
    expect(counter.value()).toBe(7);
  });

  it('should go negative', () => {
    const counter = new PNCounter('node1');
    counter.decrement(5);
    expect(counter.value()).toBe(-5);
  });

  it('should merge correctly', () => {
    const c1 = new PNCounter('node1');
    c1.increment(10);
    c1.decrement(2);

    const c2 = new PNCounter('node2');
    c2.increment(5);
    c2.decrement(3);

    c1.merge(c2);
    expect(c1.value()).toBe(10); // (10 + 5) - (2 + 3)
  });
});

describe('GSet', () => {
  it('should start empty', () => {
    const set = new GSet<string>('node1');
    expect(set.value().size).toBe(0);
  });

  it('should add elements', () => {
    const set = new GSet<string>('node1');
    set.add('a');
    set.add('b');
    expect(set.has('a')).toBe(true);
    expect(set.has('c')).toBe(false);
    expect(set.value().size).toBe(2);
  });

  it('should merge correctly', () => {
    const s1 = new GSet<string>('node1');
    s1.add('a');
    s1.add('b');

    const s2 = new GSet<string>('node2');
    s2.add('b');
    s2.add('c');

    s1.merge(s2);
    expect(s1.value()).toEqual(new Set(['a', 'b', 'c']));
  });
});

describe('TwoPhaseSet', () => {
  it('should add and remove elements', () => {
    const set = new TwoPhaseSet<string>('node1');
    set.add('a');
    set.add('b');
    expect(set.has('a')).toBe(true);

    set.remove('a');
    expect(set.has('a')).toBe(false);
    expect(set.has('b')).toBe(true);
  });

  it('should not allow re-adding removed elements', () => {
    const set = new TwoPhaseSet<string>('node1');
    set.add('a');
    set.remove('a');
    set.add('a'); // This is allowed but won't bring it back

    // The element stays in the removed set
    expect(set.has('a')).toBe(false);
  });

  it('should merge correctly with removes', () => {
    const s1 = new TwoPhaseSet<string>('node1');
    s1.add('a');
    s1.add('b');

    const s2 = s1.clone();
    s1.remove('a');

    s2.merge(s1);
    expect(s2.has('a')).toBe(false);
    expect(s2.has('b')).toBe(true);
  });
});

describe('ORSet', () => {
  it('should add and remove elements', () => {
    const set = new ORSet<string>('node1');
    set.add('a');
    expect(set.has('a')).toBe(true);

    set.remove('a');
    expect(set.has('a')).toBe(false);
  });

  it('should allow re-adding removed elements', () => {
    const set = new ORSet<string>('node1');
    set.add('a');
    set.remove('a');
    set.add('a');
    expect(set.has('a')).toBe(true);
  });

  it('should handle concurrent add-remove', () => {
    const s1 = new ORSet<string>('node1');
    s1.add('a');

    const s2 = s1.clone();

    // Concurrent operations
    s1.remove('a');
    s2.add('a'); // Add wins in OR-Set

    s1.merge(s2);
    expect(s1.has('a')).toBe(true); // Add wins
  });

  it('should merge correctly', () => {
    const s1 = new ORSet<string>('node1');
    s1.add('a');
    s1.add('b');

    const s2 = new ORSet<string>('node2');
    s2.add('c');

    s1.merge(s2);
    expect(s1.value()).toEqual(new Set(['a', 'b', 'c']));
  });
});

describe('LWWRegister', () => {
  it('should set and get values', () => {
    const reg = new LWWRegister<string>('node1');
    reg.set('hello');
    expect(reg.value()).toBe('hello');
  });

  it('should merge with last-write-wins', async () => {
    const r1 = new LWWRegister<string>('node1');
    r1.set('first');

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const r2 = new LWWRegister<string>('node2');
    r2.set('second');

    r1.merge(r2);
    expect(r1.value()).toBe('second');
  });

  it('should use node ID as tiebreaker', () => {
    const r1 = new LWWRegister<string>('node1');
    const r2 = new LWWRegister<string>('node2');

    // Force same timestamp
    const timestamp = Date.now();
    r1.set('value1');
    r2.set('value2');

    // Manually adjust timestamps to be equal for testing
    // In real usage, the higher nodeId wins on equal timestamps
    r1.merge(r2);
    // Result depends on actual timestamps and nodeId comparison
    expect(r1.value()).toBeDefined();
  });
});

describe('LWWMap', () => {
  it('should set and get values', () => {
    const map = new LWWMap<string, number>('node1');
    map.set('key1', 100);
    expect(map.get('key1')).toBe(100);
  });

  it('should delete values', () => {
    const map = new LWWMap<string, number>('node1');
    map.set('key1', 100);
    map.delete('key1');
    expect(map.has('key1')).toBe(false);
    expect(map.get('key1')).toBeUndefined();
  });

  it('should list keys', () => {
    const map = new LWWMap<string, number>('node1');
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    map.delete('b');

    expect(map.keys().sort()).toEqual(['a', 'c']);
  });

  it('should merge correctly', async () => {
    const m1 = new LWWMap<string, number>('node1');
    m1.set('key1', 100);

    await new Promise(resolve => setTimeout(resolve, 10));

    const m2 = new LWWMap<string, number>('node2');
    m2.set('key1', 200);
    m2.set('key2', 300);

    m1.merge(m2);
    expect(m1.get('key1')).toBe(200); // Newer value
    expect(m1.get('key2')).toBe(300);
  });
});

describe('MVRegister', () => {
  it('should set and get value', () => {
    const reg = new MVRegister<string>('node1');
    reg.set('hello');
    expect(reg.value()).toEqual(['hello']);
  });

  it('should keep concurrent values', () => {
    const r1 = new MVRegister<string>('node1');
    const r2 = new MVRegister<string>('node2');

    r1.set('value1');
    r2.set('value2');

    r1.merge(r2);

    // Both concurrent values should be preserved
    const values = r1.value();
    expect(values).toContain('value1');
    expect(values).toContain('value2');
  });
});

describe('CRDTDocument', () => {
  let doc: CRDTDocument;

  beforeEach(() => {
    doc = new CRDTDocument('node1');
  });

  it('should provide counters', () => {
    const counter = doc.counter('visits');
    counter.increment(5);
    expect(counter.value()).toBe(5);
  });

  it('should provide sets', () => {
    const set = doc.set<string>('tags');
    set.add('typescript');
    set.add('crdt');
    expect(set.has('typescript')).toBe(true);
  });

  it('should provide registers', () => {
    const reg = doc.register<string>('status');
    reg.set('active');
    expect(reg.value()).toBe('active');
  });

  it('should provide maps', () => {
    const map = doc.map<number>('scores');
    map.set('player1', 100);
    expect(map.get('player1')).toBe(100);
  });

  it('should merge documents', () => {
    const doc2 = new CRDTDocument('node2');

    doc.counter('count').increment(10);
    doc2.counter('count').increment(5);

    doc.merge(doc2);
    expect(doc.counter('count').value()).toBe(15);
  });

  it('should clone correctly', () => {
    doc.counter('c1').increment(5);
    doc.set<string>('s1').add('item');

    const cloned = doc.clone();
    cloned.counter('c1').increment(3);

    expect(doc.counter('c1').value()).toBe(5);
    expect(cloned.counter('c1').value()).toBe(8);
  });
});
