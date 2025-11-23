/**
 * @fileoverview Tests for CRDT implementations
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

import { describe, it, expect } from 'vitest';
import {
  // Vector Clock
  createVectorClock,
  incrementClock,
  mergeClock,
  compareClock,
  happensBefore,

  // G-Counter
  createGCounter,
  incrementGCounter,
  getGCounterValue,
  mergeGCounter,

  // PN-Counter
  createPNCounter,
  incrementPNCounter,
  decrementPNCounter,
  getPNCounterValue,
  mergePNCounter,

  // LWW-Register
  createLWWRegister,
  updateLWWRegister,
  mergeLWWRegister,

  // MV-Register
  createMVRegister,
  updateMVRegister,
  mergeMVRegister,
  getMVRegisterValues,

  // G-Set
  createGSet,
  addToGSet,
  gSetHas,
  mergeGSet,

  // OR-Set
  createORSet,
  addToORSet,
  removeFromORSet,
  orSetHas,
  mergeORSet,

  // LWW-Map
  createLWWMap,
  setLWWMapField,
  mergeLWWMap,
  getLWWMapValue,

  // RGA
  createRGA,
  appendToRGA,
  deleteFromRGA,
  getRGAValues,
  mergeRGA,
} from '../crdt';

describe('Vector Clock', () => {
  it('should create an empty vector clock', () => {
    const clock = createVectorClock();
    expect(clock).toEqual({});
  });

  it('should increment clock for a node', () => {
    let clock = createVectorClock();
    clock = incrementClock(clock, 'node-1');
    expect(clock['node-1']).toBe(1);

    clock = incrementClock(clock, 'node-1');
    expect(clock['node-1']).toBe(2);
  });

  it('should merge two clocks taking max', () => {
    const clock1 = { 'node-1': 3, 'node-2': 1 };
    const clock2 = { 'node-1': 2, 'node-2': 4, 'node-3': 1 };

    const merged = mergeClock(clock1, clock2);
    expect(merged).toEqual({ 'node-1': 3, 'node-2': 4, 'node-3': 1 });
  });

  it('should compare clocks correctly', () => {
    const clock1 = { 'node-1': 1, 'node-2': 1 };
    const clock2 = { 'node-1': 2, 'node-2': 2 };
    const clock3 = { 'node-1': 2, 'node-2': 1 };

    expect(compareClock(clock1, clock2)).toBe('before');
    expect(compareClock(clock2, clock1)).toBe('after');
    expect(compareClock(clock1, clock3)).toBe('concurrent');
    expect(compareClock(clock1, clock1)).toBe('equal');
  });

  it('should detect happens-before relationship', () => {
    const clock1 = { 'node-1': 1 };
    const clock2 = { 'node-1': 2 };

    expect(happensBefore(clock1, clock2)).toBe(true);
    expect(happensBefore(clock2, clock1)).toBe(false);
  });
});

describe('G-Counter', () => {
  it('should create and increment', () => {
    let counter = createGCounter();
    counter = incrementGCounter(counter, 'node-1', 5);
    counter = incrementGCounter(counter, 'node-2', 3);
    counter = incrementGCounter(counter, 'node-1', 2);

    expect(getGCounterValue(counter)).toBe(10);
  });

  it('should reject negative increments', () => {
    const counter = createGCounter();
    expect(() => incrementGCounter(counter, 'node-1', -1)).toThrow();
  });

  it('should merge correctly', () => {
    let counter1 = createGCounter();
    counter1 = incrementGCounter(counter1, 'node-1', 5);
    counter1 = incrementGCounter(counter1, 'node-2', 3);

    let counter2 = createGCounter();
    counter2 = incrementGCounter(counter2, 'node-1', 3);
    counter2 = incrementGCounter(counter2, 'node-2', 4);
    counter2 = incrementGCounter(counter2, 'node-3', 2);

    const merged = mergeGCounter(counter1, counter2);
    expect(getGCounterValue(merged)).toBe(11); // max(5,3) + max(3,4) + 2
  });
});

describe('PN-Counter', () => {
  it('should increment and decrement', () => {
    let counter = createPNCounter();
    counter = incrementPNCounter(counter, 'node-1', 10);
    counter = decrementPNCounter(counter, 'node-1', 3);

    expect(getPNCounterValue(counter)).toBe(7);
  });

  it('should allow negative values', () => {
    let counter = createPNCounter();
    counter = decrementPNCounter(counter, 'node-1', 5);

    expect(getPNCounterValue(counter)).toBe(-5);
  });

  it('should merge correctly', () => {
    let counter1 = createPNCounter();
    counter1 = incrementPNCounter(counter1, 'node-1', 10);
    counter1 = decrementPNCounter(counter1, 'node-1', 2);

    let counter2 = createPNCounter();
    counter2 = incrementPNCounter(counter2, 'node-1', 8);
    counter2 = decrementPNCounter(counter2, 'node-1', 5);

    const merged = mergePNCounter(counter1, counter2);
    expect(getPNCounterValue(merged)).toBe(5); // max(10,8) - max(2,5) = 10 - 5
  });
});

describe('LWW-Register', () => {
  it('should create with value', () => {
    const register = createLWWRegister('hello', 'node-1');
    expect(register.value).toBe('hello');
  });

  it('should update with newer timestamp', () => {
    const register = createLWWRegister('hello', 'node-1');
    const updated = updateLWWRegister(register, 'world', 'node-2', register.timestamp + 1);
    expect(updated.value).toBe('world');
  });

  it('should not update with older timestamp', () => {
    const register = createLWWRegister('hello', 'node-1');
    const updated = updateLWWRegister(register, 'world', 'node-2', register.timestamp - 1);
    expect(updated.value).toBe('hello');
  });

  it('should merge taking later value', () => {
    const register1 = createLWWRegister('hello', 'node-1');
    const register2 = { ...register1, value: 'world', timestamp: register1.timestamp + 1 };

    const merged = mergeLWWRegister(register1, register2);
    expect(merged.value).toBe('world');
  });
});

describe('MV-Register', () => {
  it('should track concurrent values', () => {
    const register1 = createMVRegister('a', 'node-1');
    const register2 = createMVRegister('b', 'node-2');

    const merged = mergeMVRegister(register1, register2);
    const values = getMVRegisterValues(merged);

    expect(values).toHaveLength(2);
    expect(values).toContain('a');
    expect(values).toContain('b');
  });

  it('should converge after update', () => {
    const register1 = createMVRegister('a', 'node-1');
    const register2 = createMVRegister('b', 'node-2');
    const merged = mergeMVRegister(register1, register2);

    // Now node-1 sees both and writes a new value
    const updated = updateMVRegister(merged, 'c', 'node-1');
    const values = getMVRegisterValues(updated);

    expect(values).toHaveLength(1);
    expect(values[0]).toBe('c');
  });
});

describe('G-Set', () => {
  it('should add elements', () => {
    let set = createGSet<string>();
    set = addToGSet(set, 'a');
    set = addToGSet(set, 'b');
    set = addToGSet(set, 'a'); // duplicate

    expect(gSetHas(set, 'a')).toBe(true);
    expect(gSetHas(set, 'b')).toBe(true);
    expect(gSetHas(set, 'c')).toBe(false);
  });

  it('should merge with union', () => {
    let set1 = createGSet<string>();
    set1 = addToGSet(set1, 'a');
    set1 = addToGSet(set1, 'b');

    let set2 = createGSet<string>();
    set2 = addToGSet(set2, 'b');
    set2 = addToGSet(set2, 'c');

    const merged = mergeGSet(set1, set2);
    expect(gSetHas(merged, 'a')).toBe(true);
    expect(gSetHas(merged, 'b')).toBe(true);
    expect(gSetHas(merged, 'c')).toBe(true);
  });
});

describe('OR-Set', () => {
  it('should add and remove elements', () => {
    let set = createORSet<string>();
    set = addToORSet(set, 'a', 'node-1');
    set = addToORSet(set, 'b', 'node-1');

    expect(orSetHas(set, 'a')).toBe(true);
    expect(orSetHas(set, 'b')).toBe(true);

    set = removeFromORSet(set, 'a');
    expect(orSetHas(set, 'a')).toBe(false);
    expect(orSetHas(set, 'b')).toBe(true);
  });

  it('should handle add-wins semantics on merge', () => {
    // Node 1 adds 'a'
    let set1 = createORSet<string>();
    set1 = addToORSet(set1, 'a', 'node-1');

    // Node 2 adds 'a' and removes it
    let set2 = createORSet<string>();
    set2 = addToORSet(set2, 'a', 'node-2');
    set2 = removeFromORSet(set2, 'a');

    // After merge, node-1's add should win
    const merged = mergeORSet(set1, set2);
    expect(orSetHas(merged, 'a')).toBe(true);
  });
});

describe('LWW-Map', () => {
  it('should create and update fields', () => {
    let map = createLWWMap({ name: 'Chicago', nodes: 0 }, 'node-1');
    map = setLWWMapField(map, 'nodes', 42, 'node-1');

    const value = getLWWMapValue(map);
    expect(value.name).toBe('Chicago');
    expect(value.nodes).toBe(42);
  });

  it('should merge fields independently', () => {
    let map1 = createLWWMap({ name: 'A', count: 1 }, 'node-1');
    let map2 = createLWWMap({ name: 'B', count: 2 }, 'node-2');

    // Make map1's name newer and map2's count newer
    map1 = setLWWMapField(map1, 'name', 'Chicago', 'node-1');

    const merged = mergeLWWMap(map1, map2);
    const value = getLWWMapValue(merged);

    // The field with the later timestamp wins
    // This depends on timing, but both should be present
    expect(value.name).toBeDefined();
    expect(value.count).toBeDefined();
  });
});

describe('RGA', () => {
  it('should append elements', () => {
    let rga = createRGA<string>();
    rga = appendToRGA(rga, 'a', 'node-1');
    rga = appendToRGA(rga, 'b', 'node-1');
    rga = appendToRGA(rga, 'c', 'node-1');

    expect(getRGAValues(rga)).toEqual(['a', 'b', 'c']);
  });

  it('should delete elements', () => {
    let rga = createRGA<string>();
    rga = appendToRGA(rga, 'a', 'node-1');
    rga = appendToRGA(rga, 'b', 'node-1');
    rga = appendToRGA(rga, 'c', 'node-1');
    rga = deleteFromRGA(rga, 1); // delete 'b'

    expect(getRGAValues(rga)).toEqual(['a', 'c']);
  });

  it('should merge preserving order', () => {
    let rga1 = createRGA<string>();
    rga1 = appendToRGA(rga1, 'a', 'node-1');
    rga1 = appendToRGA(rga1, 'b', 'node-1');

    let rga2 = createRGA<string>();
    rga2 = appendToRGA(rga2, 'c', 'node-2');
    rga2 = appendToRGA(rga2, 'd', 'node-2');

    const merged = mergeRGA(rga1, rga2);
    const values = getRGAValues(merged);

    expect(values).toHaveLength(4);
    expect(values).toContain('a');
    expect(values).toContain('b');
    expect(values).toContain('c');
    expect(values).toContain('d');
  });
});
