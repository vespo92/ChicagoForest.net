/**
 * @fileoverview CRDT (Conflict-free Replicated Data Types) implementations
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * NOT operational infrastructure. Based on real distributed systems research:
 * - Shapiro et al. (2011) - "Conflict-free Replicated Data Types"
 * - Preguiça et al. (2018) - "Conflict-free Replicated Data Types: An Overview"
 *
 * @see https://crdt.tech/ for comprehensive CRDT documentation
 */

import type { NodeId } from '@chicago-forest/shared-types';
import type {
  VectorClock,
  CausalityRelation,
  HybridLogicalClock,
  GCounter,
  PNCounter,
  LWWRegister,
  MVRegister,
  GSet,
  ORSet,
  LWWMap,
  RGA,
} from '../types';

// ============================================================================
// Vector Clock Operations
// ============================================================================

/**
 * Create a new empty vector clock
 */
export function createVectorClock(): VectorClock {
  return {};
}

/**
 * Increment the clock for a specific node
 */
export function incrementClock(clock: VectorClock, nodeId: NodeId): VectorClock {
  return {
    ...clock,
    [nodeId]: (clock[nodeId] || 0) + 1,
  };
}

/**
 * Merge two vector clocks (take max of each component)
 */
export function mergeClock(a: VectorClock, b: VectorClock): VectorClock {
  const result: VectorClock = { ...a };

  for (const [nodeId, timestamp] of Object.entries(b)) {
    result[nodeId] = Math.max(result[nodeId] || 0, timestamp);
  }

  return result;
}

/**
 * Compare two vector clocks to determine causality
 */
export function compareClock(a: VectorClock, b: VectorClock): CausalityRelation {
  const allNodes = new Set([...Object.keys(a), ...Object.keys(b)]);

  let aBeforeB = true;
  let bBeforeA = true;

  for (const nodeId of allNodes) {
    const aTime = a[nodeId] || 0;
    const bTime = b[nodeId] || 0;

    if (aTime > bTime) bBeforeA = false;
    if (bTime > aTime) aBeforeB = false;
  }

  if (aBeforeB && bBeforeA) return 'equal';
  if (aBeforeB) return 'before';
  if (bBeforeA) return 'after';
  return 'concurrent';
}

/**
 * Check if clock A happened before clock B
 */
export function happensBefore(a: VectorClock, b: VectorClock): boolean {
  return compareClock(a, b) === 'before';
}

// ============================================================================
// Hybrid Logical Clock Operations
// ============================================================================

/**
 * Create a new HLC timestamp
 */
export function createHLC(nodeId: NodeId): HybridLogicalClock {
  return {
    physical: Date.now(),
    logical: 0,
    nodeId,
  };
}

/**
 * Send event - update HLC before sending
 */
export function hlcSend(current: HybridLogicalClock, nodeId: NodeId): HybridLogicalClock {
  const now = Date.now();

  if (now > current.physical) {
    return { physical: now, logical: 0, nodeId };
  }

  return {
    physical: current.physical,
    logical: current.logical + 1,
    nodeId,
  };
}

/**
 * Receive event - merge HLC with received timestamp
 */
export function hlcReceive(
  local: HybridLogicalClock,
  remote: HybridLogicalClock,
  nodeId: NodeId
): HybridLogicalClock {
  const now = Date.now();
  const maxPhysical = Math.max(now, local.physical, remote.physical);

  if (maxPhysical === now && now > local.physical && now > remote.physical) {
    return { physical: now, logical: 0, nodeId };
  }

  if (maxPhysical === local.physical && local.physical === remote.physical) {
    return {
      physical: maxPhysical,
      logical: Math.max(local.logical, remote.logical) + 1,
      nodeId,
    };
  }

  if (maxPhysical === local.physical) {
    return { physical: maxPhysical, logical: local.logical + 1, nodeId };
  }

  if (maxPhysical === remote.physical) {
    return { physical: maxPhysical, logical: remote.logical + 1, nodeId };
  }

  return { physical: maxPhysical, logical: 0, nodeId };
}

/**
 * Compare two HLC timestamps
 */
export function compareHLC(a: HybridLogicalClock, b: HybridLogicalClock): number {
  if (a.physical !== b.physical) {
    return a.physical - b.physical;
  }
  if (a.logical !== b.logical) {
    return a.logical - b.logical;
  }
  return a.nodeId.localeCompare(b.nodeId);
}

// ============================================================================
// G-Counter (Grow-only Counter)
// ============================================================================

/**
 * Create a new G-Counter
 */
export function createGCounter(): GCounter {
  return { type: 'g-counter', counts: {} };
}

/**
 * Increment a G-Counter for a node
 */
export function incrementGCounter(counter: GCounter, nodeId: NodeId, amount = 1): GCounter {
  if (amount < 0) {
    throw new Error('G-Counter only supports positive increments');
  }

  return {
    type: 'g-counter',
    counts: {
      ...counter.counts,
      [nodeId]: (counter.counts[nodeId] || 0) + amount,
    },
  };
}

/**
 * Get the value of a G-Counter
 */
export function getGCounterValue(counter: GCounter): number {
  return Object.values(counter.counts).reduce((sum, count) => sum + count, 0);
}

/**
 * Merge two G-Counters
 */
export function mergeGCounter(a: GCounter, b: GCounter): GCounter {
  const counts: Record<NodeId, number> = { ...a.counts };

  for (const [nodeId, count] of Object.entries(b.counts)) {
    counts[nodeId] = Math.max(counts[nodeId] || 0, count);
  }

  return { type: 'g-counter', counts };
}

// ============================================================================
// PN-Counter (Positive-Negative Counter)
// ============================================================================

/**
 * Create a new PN-Counter
 */
export function createPNCounter(): PNCounter {
  return { type: 'pn-counter', positive: {}, negative: {} };
}

/**
 * Increment a PN-Counter
 */
export function incrementPNCounter(counter: PNCounter, nodeId: NodeId, amount = 1): PNCounter {
  if (amount >= 0) {
    return {
      ...counter,
      positive: {
        ...counter.positive,
        [nodeId]: (counter.positive[nodeId] || 0) + amount,
      },
    };
  }

  return {
    ...counter,
    negative: {
      ...counter.negative,
      [nodeId]: (counter.negative[nodeId] || 0) + Math.abs(amount),
    },
  };
}

/**
 * Decrement a PN-Counter
 */
export function decrementPNCounter(counter: PNCounter, nodeId: NodeId, amount = 1): PNCounter {
  return incrementPNCounter(counter, nodeId, -amount);
}

/**
 * Get the value of a PN-Counter
 */
export function getPNCounterValue(counter: PNCounter): number {
  const positive = Object.values(counter.positive).reduce((sum, count) => sum + count, 0);
  const negative = Object.values(counter.negative).reduce((sum, count) => sum + count, 0);
  return positive - negative;
}

/**
 * Merge two PN-Counters
 */
export function mergePNCounter(a: PNCounter, b: PNCounter): PNCounter {
  const positive: Record<NodeId, number> = { ...a.positive };
  const negative: Record<NodeId, number> = { ...a.negative };

  for (const [nodeId, count] of Object.entries(b.positive)) {
    positive[nodeId] = Math.max(positive[nodeId] || 0, count);
  }

  for (const [nodeId, count] of Object.entries(b.negative)) {
    negative[nodeId] = Math.max(negative[nodeId] || 0, count);
  }

  return { type: 'pn-counter', positive, negative };
}

// ============================================================================
// LWW-Register (Last-Write-Wins Register)
// ============================================================================

/**
 * Create a new LWW-Register
 */
export function createLWWRegister<T>(value: T, nodeId: NodeId): LWWRegister<T> {
  return {
    type: 'lww-register',
    value,
    timestamp: Date.now(),
    origin: nodeId,
  };
}

/**
 * Update an LWW-Register
 */
export function updateLWWRegister<T>(
  register: LWWRegister<T>,
  value: T,
  nodeId: NodeId,
  timestamp = Date.now()
): LWWRegister<T> {
  if (timestamp > register.timestamp ||
      (timestamp === register.timestamp && nodeId > register.origin)) {
    return { type: 'lww-register', value, timestamp, origin: nodeId };
  }
  return register;
}

/**
 * Merge two LWW-Registers
 */
export function mergeLWWRegister<T>(a: LWWRegister<T>, b: LWWRegister<T>): LWWRegister<T> {
  if (b.timestamp > a.timestamp ||
      (b.timestamp === a.timestamp && b.origin > a.origin)) {
    return b;
  }
  return a;
}

// ============================================================================
// MV-Register (Multi-Value Register)
// ============================================================================

/**
 * Create a new MV-Register
 */
export function createMVRegister<T>(value: T, nodeId: NodeId): MVRegister<T> {
  return {
    type: 'mv-register',
    values: [{
      value,
      version: { [nodeId]: 1 },
      origin: nodeId,
    }],
  };
}

/**
 * Update an MV-Register
 */
export function updateMVRegister<T>(
  register: MVRegister<T>,
  value: T,
  nodeId: NodeId
): MVRegister<T> {
  // Merge all current versions and increment this node's clock
  const mergedVersion = register.values.reduce(
    (acc, v) => mergeClock(acc, v.version),
    {} as VectorClock
  );

  const newVersion = incrementClock(mergedVersion, nodeId);

  return {
    type: 'mv-register',
    values: [{
      value,
      version: newVersion,
      origin: nodeId,
    }],
  };
}

/**
 * Merge two MV-Registers
 */
export function mergeMVRegister<T>(a: MVRegister<T>, b: MVRegister<T>): MVRegister<T> {
  const allValues = [...a.values, ...b.values];
  const surviving: MVRegister<T>['values'] = [];

  for (const value of allValues) {
    // Check if any other value dominates this one
    const isDominated = allValues.some(other => {
      if (other === value) return false;
      return compareClock(value.version, other.version) === 'before';
    });

    if (!isDominated) {
      // Check if we already have an equivalent value
      const alreadyExists = surviving.some(s =>
        compareClock(s.version, value.version) === 'equal'
      );

      if (!alreadyExists) {
        surviving.push(value);
      }
    }
  }

  return { type: 'mv-register', values: surviving };
}

/**
 * Get all concurrent values from an MV-Register
 */
export function getMVRegisterValues<T>(register: MVRegister<T>): T[] {
  return register.values.map(v => v.value);
}

// ============================================================================
// G-Set (Grow-only Set)
// ============================================================================

/**
 * Create a new G-Set
 */
export function createGSet<T>(): GSet<T> {
  return { type: 'g-set', elements: new Set() };
}

/**
 * Add an element to a G-Set
 */
export function addToGSet<T>(set: GSet<T>, element: T): GSet<T> {
  const newElements = new Set(set.elements);
  newElements.add(element);
  return { type: 'g-set', elements: newElements };
}

/**
 * Check if an element exists in a G-Set
 */
export function gSetHas<T>(set: GSet<T>, element: T): boolean {
  return set.elements.has(element);
}

/**
 * Merge two G-Sets
 */
export function mergeGSet<T>(a: GSet<T>, b: GSet<T>): GSet<T> {
  const elements = new Set([...a.elements, ...b.elements]);
  return { type: 'g-set', elements };
}

// ============================================================================
// OR-Set (Observed-Remove Set)
// ============================================================================

/**
 * Create a new OR-Set
 */
export function createORSet<T>(): ORSet<T> {
  return {
    type: 'or-set',
    elements: new Map(),
    tombstones: new Map(),
  };
}

/**
 * Generate a unique tag for OR-Set operations
 */
function generateTag(nodeId: NodeId): string {
  return `${nodeId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

/**
 * Add an element to an OR-Set
 */
export function addToORSet<T>(set: ORSet<T>, element: T, nodeId: NodeId): ORSet<T> {
  const newElements = new Map(set.elements);
  const tags = new Set(newElements.get(element) || []);
  tags.add(generateTag(nodeId));
  newElements.set(element, tags);

  return {
    type: 'or-set',
    elements: newElements,
    tombstones: set.tombstones,
  };
}

/**
 * Remove an element from an OR-Set
 */
export function removeFromORSet<T>(set: ORSet<T>, element: T): ORSet<T> {
  const currentTags = set.elements.get(element);
  if (!currentTags || currentTags.size === 0) {
    return set;
  }

  const newElements = new Map(set.elements);
  const newTombstones = new Map(set.tombstones);

  // Move all current tags to tombstones
  const existingTombstones = new Set(newTombstones.get(element) || []);
  for (const tag of currentTags) {
    existingTombstones.add(tag);
  }
  newTombstones.set(element, existingTombstones);

  // Remove the element
  newElements.delete(element);

  return {
    type: 'or-set',
    elements: newElements,
    tombstones: newTombstones,
  };
}

/**
 * Check if an element exists in an OR-Set
 */
export function orSetHas<T>(set: ORSet<T>, element: T): boolean {
  const tags = set.elements.get(element);
  return tags !== undefined && tags.size > 0;
}

/**
 * Merge two OR-Sets
 */
export function mergeORSet<T>(a: ORSet<T>, b: ORSet<T>): ORSet<T> {
  const elements = new Map<T, Set<string>>();
  const tombstones = new Map<T, Set<string>>();

  // Merge all tombstones first
  for (const [elem, tags] of a.tombstones) {
    tombstones.set(elem, new Set(tags));
  }
  for (const [elem, tags] of b.tombstones) {
    const existing = tombstones.get(elem) || new Set();
    for (const tag of tags) {
      existing.add(tag);
    }
    tombstones.set(elem, existing);
  }

  // Merge elements, excluding tombstoned tags
  for (const [elem, tags] of a.elements) {
    const deadTags = tombstones.get(elem) || new Set();
    const liveTags = new Set([...tags].filter(t => !deadTags.has(t)));
    if (liveTags.size > 0) {
      elements.set(elem, liveTags);
    }
  }

  for (const [elem, tags] of b.elements) {
    const deadTags = tombstones.get(elem) || new Set();
    const liveTags = new Set([...tags].filter(t => !deadTags.has(t)));

    if (liveTags.size > 0) {
      const existing = elements.get(elem) || new Set();
      for (const tag of liveTags) {
        existing.add(tag);
      }
      elements.set(elem, existing);
    }
  }

  return { type: 'or-set', elements, tombstones };
}

// ============================================================================
// LWW-Map (Last-Write-Wins Map)
// ============================================================================

/**
 * Create a new LWW-Map
 */
export function createLWWMap<T extends Record<string, unknown>>(
  initial: T,
  nodeId: NodeId
): LWWMap<T> {
  const fields = {} as LWWMap<T>['fields'];
  const timestamp = Date.now();

  for (const [key, value] of Object.entries(initial)) {
    (fields as Record<string, LWWRegister<unknown>>)[key] = {
      type: 'lww-register',
      value,
      timestamp,
      origin: nodeId,
    };
  }

  return { type: 'lww-map', fields };
}

/**
 * Set a field in an LWW-Map
 */
export function setLWWMapField<T extends Record<string, unknown>, K extends keyof T>(
  map: LWWMap<T>,
  key: K,
  value: T[K],
  nodeId: NodeId
): LWWMap<T> {
  const timestamp = Date.now();
  const currentField = map.fields[key];

  if (!currentField ||
      timestamp > currentField.timestamp ||
      (timestamp === currentField.timestamp && nodeId > currentField.origin)) {
    return {
      type: 'lww-map',
      fields: {
        ...map.fields,
        [key]: { type: 'lww-register', value, timestamp, origin: nodeId },
      },
    };
  }

  return map;
}

/**
 * Merge two LWW-Maps
 */
export function mergeLWWMap<T extends Record<string, unknown>>(
  a: LWWMap<T>,
  b: LWWMap<T>
): LWWMap<T> {
  const fields = { ...a.fields } as LWWMap<T>['fields'];

  for (const [key, bField] of Object.entries(b.fields)) {
    const aField = (fields as Record<string, LWWRegister<unknown>>)[key];

    if (!aField ||
        bField.timestamp > aField.timestamp ||
        (bField.timestamp === aField.timestamp && bField.origin > aField.origin)) {
      (fields as Record<string, LWWRegister<unknown>>)[key] = bField;
    }
  }

  return { type: 'lww-map', fields };
}

/**
 * Get plain object from LWW-Map
 */
export function getLWWMapValue<T extends Record<string, unknown>>(map: LWWMap<T>): T {
  const result = {} as T;

  for (const [key, field] of Object.entries(map.fields)) {
    (result as Record<string, unknown>)[key] = field.value;
  }

  return result;
}

// ============================================================================
// RGA (Replicated Growable Array)
// ============================================================================

/**
 * Create a new RGA
 */
export function createRGA<T>(): RGA<T> {
  return { type: 'rga', elements: [] };
}

/**
 * Generate element ID for RGA
 */
function generateElementId(nodeId: NodeId): string {
  return `${nodeId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

/**
 * Insert an element into RGA at a specific index
 */
export function insertIntoRGA<T>(
  rga: RGA<T>,
  index: number,
  value: T,
  nodeId: NodeId
): RGA<T> {
  const elements = [...rga.elements];
  const element = {
    id: generateElementId(nodeId),
    value,
    deleted: false,
    origin: nodeId,
    timestamp: Date.now(),
  };

  // Find the actual index considering deleted elements
  let actualIndex = 0;
  let visibleCount = 0;

  while (actualIndex < elements.length && visibleCount < index) {
    if (!elements[actualIndex].deleted) {
      visibleCount++;
    }
    actualIndex++;
  }

  elements.splice(actualIndex, 0, element);

  return { type: 'rga', elements };
}

/**
 * Append an element to RGA
 */
export function appendToRGA<T>(rga: RGA<T>, value: T, nodeId: NodeId): RGA<T> {
  const visibleCount = rga.elements.filter(e => !e.deleted).length;
  return insertIntoRGA(rga, visibleCount, value, nodeId);
}

/**
 * Delete an element from RGA by index
 */
export function deleteFromRGA<T>(rga: RGA<T>, index: number): RGA<T> {
  const elements = [...rga.elements];
  let actualIndex = 0;
  let visibleCount = 0;

  while (actualIndex < elements.length) {
    if (!elements[actualIndex].deleted) {
      if (visibleCount === index) {
        elements[actualIndex] = { ...elements[actualIndex], deleted: true };
        return { type: 'rga', elements };
      }
      visibleCount++;
    }
    actualIndex++;
  }

  return rga;
}

/**
 * Get visible elements from RGA
 */
export function getRGAValues<T>(rga: RGA<T>): T[] {
  return rga.elements
    .filter(e => !e.deleted)
    .map(e => e.value);
}

/**
 * Merge two RGAs
 */
export function mergeRGA<T>(a: RGA<T>, b: RGA<T>): RGA<T> {
  const allElements = new Map<string, RGA<T>['elements'][0]>();

  // Collect all unique elements
  for (const elem of [...a.elements, ...b.elements]) {
    const existing = allElements.get(elem.id);
    if (!existing || elem.deleted) {
      allElements.set(elem.id, elem);
    }
  }

  // Sort by timestamp and node ID for deterministic ordering
  const elements = [...allElements.values()].sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    return a.origin.localeCompare(b.origin);
  });

  return { type: 'rga', elements };
}

// ============================================================================
// Exports
// ============================================================================

export {
  // Types re-exported for convenience
  type VectorClock,
  type CausalityRelation,
  type HybridLogicalClock,
  type GCounter,
  type PNCounter,
  type LWWRegister,
  type MVRegister,
  type GSet,
  type ORSet,
  type LWWMap,
  type RGA,
};
