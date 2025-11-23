/**
 * CRDT (Conflict-free Replicated Data Types)
 *
 * State-based CRDTs for distributed data synchronization.
 * These data structures automatically converge to consistent state
 * without requiring coordination between nodes.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for the Chicago Plasma Forest Network project.
 */

/**
 * Base interface for all CRDT types
 */
export interface CRDT<T> {
  readonly nodeId: string;
  value(): T;
  merge(other: this): void;
  clone(): this;
  toJSON(): unknown;
}

/**
 * Vector Clock for tracking causality
 */
export class VectorClock {
  private clock: Map<string, number>;

  constructor(initial?: Map<string, number> | Record<string, number>) {
    if (initial instanceof Map) {
      this.clock = new Map(initial);
    } else if (initial) {
      this.clock = new Map(Object.entries(initial));
    } else {
      this.clock = new Map();
    }
  }

  increment(nodeId: string): void {
    const current = this.clock.get(nodeId) || 0;
    this.clock.set(nodeId, current + 1);
  }

  get(nodeId: string): number {
    return this.clock.get(nodeId) || 0;
  }

  merge(other: VectorClock): void {
    for (const [nodeId, version] of other.clock) {
      const current = this.clock.get(nodeId) || 0;
      this.clock.set(nodeId, Math.max(current, version));
    }
  }

  compare(other: VectorClock): 'before' | 'after' | 'concurrent' | 'equal' {
    let thisBefore = false;
    let thisAfter = false;

    const allNodes = new Set([...this.clock.keys(), ...other.clock.keys()]);

    for (const nodeId of allNodes) {
      const thisVersion = this.get(nodeId);
      const otherVersion = other.get(nodeId);

      if (thisVersion < otherVersion) thisBefore = true;
      if (thisVersion > otherVersion) thisAfter = true;
    }

    if (thisBefore && thisAfter) return 'concurrent';
    if (thisBefore) return 'before';
    if (thisAfter) return 'after';
    return 'equal';
  }

  clone(): VectorClock {
    return new VectorClock(this.clock);
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.clock);
  }

  static fromJSON(json: Record<string, number>): VectorClock {
    return new VectorClock(json);
  }
}

/**
 * G-Counter (Grow-only Counter)
 * A counter that can only increment
 */
export class GCounter implements CRDT<number> {
  readonly nodeId: string;
  private counts: Map<string, number>;

  constructor(nodeId: string, initial?: Map<string, number>) {
    this.nodeId = nodeId;
    this.counts = initial ? new Map(initial) : new Map();
  }

  increment(amount: number = 1): void {
    if (amount < 0) throw new Error('G-Counter can only increment');
    const current = this.counts.get(this.nodeId) || 0;
    this.counts.set(this.nodeId, current + amount);
  }

  value(): number {
    let sum = 0;
    for (const count of this.counts.values()) {
      sum += count;
    }
    return sum;
  }

  merge(other: GCounter): void {
    for (const [nodeId, count] of other.counts) {
      const current = this.counts.get(nodeId) || 0;
      this.counts.set(nodeId, Math.max(current, count));
    }
  }

  clone(): GCounter {
    return new GCounter(this.nodeId, new Map(this.counts));
  }

  toJSON(): { nodeId: string; counts: Record<string, number> } {
    return {
      nodeId: this.nodeId,
      counts: Object.fromEntries(this.counts),
    };
  }

  static fromJSON(json: { nodeId: string; counts: Record<string, number> }): GCounter {
    return new GCounter(json.nodeId, new Map(Object.entries(json.counts)));
  }
}

/**
 * PN-Counter (Positive-Negative Counter)
 * A counter that can increment and decrement
 */
export class PNCounter implements CRDT<number> {
  readonly nodeId: string;
  private positive: GCounter;
  private negative: GCounter;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.positive = new GCounter(nodeId);
    this.negative = new GCounter(nodeId);
  }

  increment(amount: number = 1): void {
    this.positive.increment(amount);
  }

  decrement(amount: number = 1): void {
    this.negative.increment(amount);
  }

  value(): number {
    return this.positive.value() - this.negative.value();
  }

  merge(other: PNCounter): void {
    this.positive.merge(other.positive);
    this.negative.merge(other.negative);
  }

  clone(): PNCounter {
    const cloned = new PNCounter(this.nodeId);
    cloned.positive = this.positive.clone();
    cloned.negative = this.negative.clone();
    return cloned;
  }

  toJSON(): { nodeId: string; positive: unknown; negative: unknown } {
    return {
      nodeId: this.nodeId,
      positive: this.positive.toJSON(),
      negative: this.negative.toJSON(),
    };
  }

  static fromJSON(json: {
    nodeId: string;
    positive: { nodeId: string; counts: Record<string, number> };
    negative: { nodeId: string; counts: Record<string, number> };
  }): PNCounter {
    const counter = new PNCounter(json.nodeId);
    counter.positive = GCounter.fromJSON(json.positive);
    counter.negative = GCounter.fromJSON(json.negative);
    return counter;
  }
}

/**
 * G-Set (Grow-only Set)
 * A set that can only add elements
 */
export class GSet<T> implements CRDT<Set<T>> {
  readonly nodeId: string;
  private elements: Set<T>;

  constructor(nodeId: string, initial?: Iterable<T>) {
    this.nodeId = nodeId;
    this.elements = new Set(initial);
  }

  add(element: T): void {
    this.elements.add(element);
  }

  has(element: T): boolean {
    return this.elements.has(element);
  }

  value(): Set<T> {
    return new Set(this.elements);
  }

  merge(other: GSet<T>): void {
    for (const element of other.elements) {
      this.elements.add(element);
    }
  }

  clone(): GSet<T> {
    return new GSet(this.nodeId, this.elements);
  }

  toJSON(): { nodeId: string; elements: T[] } {
    return {
      nodeId: this.nodeId,
      elements: Array.from(this.elements),
    };
  }

  static fromJSON<T>(json: { nodeId: string; elements: T[] }): GSet<T> {
    return new GSet(json.nodeId, json.elements);
  }
}

/**
 * 2P-Set (Two-Phase Set)
 * A set that allows additions and removals (element can only be removed once)
 */
export class TwoPhaseSet<T> implements CRDT<Set<T>> {
  readonly nodeId: string;
  private added: GSet<T>;
  private removed: GSet<T>;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.added = new GSet(nodeId);
    this.removed = new GSet(nodeId);
  }

  add(element: T): void {
    this.added.add(element);
  }

  remove(element: T): boolean {
    if (!this.added.has(element)) return false;
    this.removed.add(element);
    return true;
  }

  has(element: T): boolean {
    return this.added.has(element) && !this.removed.has(element);
  }

  value(): Set<T> {
    const result = new Set<T>();
    for (const element of this.added.value()) {
      if (!this.removed.has(element)) {
        result.add(element);
      }
    }
    return result;
  }

  merge(other: TwoPhaseSet<T>): void {
    this.added.merge(other.added);
    this.removed.merge(other.removed);
  }

  clone(): TwoPhaseSet<T> {
    const cloned = new TwoPhaseSet<T>(this.nodeId);
    cloned.added = this.added.clone();
    cloned.removed = this.removed.clone();
    return cloned;
  }

  toJSON(): { nodeId: string; added: unknown; removed: unknown } {
    return {
      nodeId: this.nodeId,
      added: this.added.toJSON(),
      removed: this.removed.toJSON(),
    };
  }
}

/**
 * OR-Set (Observed-Remove Set)
 * A set with add-wins semantics - additions are preserved even if
 * concurrent removes occur
 */
export class ORSet<T> implements CRDT<Set<T>> {
  readonly nodeId: string;
  private elements: Map<T, Set<string>>; // element -> set of unique tags
  private removed: Set<string>; // tombstones for removed tags
  private tagCounter: number;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.elements = new Map();
    this.removed = new Set();
    this.tagCounter = 0;
  }

  private generateTag(): string {
    this.tagCounter++;
    return `${this.nodeId}:${Date.now()}:${this.tagCounter}`;
  }

  add(element: T): void {
    const tag = this.generateTag();
    if (!this.elements.has(element)) {
      this.elements.set(element, new Set());
    }
    this.elements.get(element)!.add(tag);
  }

  remove(element: T): boolean {
    const tags = this.elements.get(element);
    if (!tags || tags.size === 0) return false;

    // Mark all current tags as removed
    for (const tag of tags) {
      this.removed.add(tag);
    }
    tags.clear();
    return true;
  }

  has(element: T): boolean {
    const tags = this.elements.get(element);
    if (!tags) return false;

    // Check if any tag is not removed
    for (const tag of tags) {
      if (!this.removed.has(tag)) return true;
    }
    return false;
  }

  value(): Set<T> {
    const result = new Set<T>();
    for (const [element, tags] of this.elements) {
      for (const tag of tags) {
        if (!this.removed.has(tag)) {
          result.add(element);
          break;
        }
      }
    }
    return result;
  }

  merge(other: ORSet<T>): void {
    // Merge removed tags first
    for (const tag of other.removed) {
      this.removed.add(tag);
    }

    // Merge elements
    for (const [element, otherTags] of other.elements) {
      if (!this.elements.has(element)) {
        this.elements.set(element, new Set());
      }
      const localTags = this.elements.get(element)!;
      for (const tag of otherTags) {
        localTags.add(tag);
      }
    }

    // Clean up removed tags from elements
    for (const [element, tags] of this.elements) {
      for (const tag of tags) {
        if (this.removed.has(tag)) {
          tags.delete(tag);
        }
      }
      if (tags.size === 0) {
        this.elements.delete(element);
      }
    }
  }

  clone(): ORSet<T> {
    const cloned = new ORSet<T>(this.nodeId);
    cloned.tagCounter = this.tagCounter;
    cloned.removed = new Set(this.removed);
    for (const [element, tags] of this.elements) {
      cloned.elements.set(element, new Set(tags));
    }
    return cloned;
  }

  toJSON(): {
    nodeId: string;
    elements: Array<[T, string[]]>;
    removed: string[];
    tagCounter: number;
  } {
    return {
      nodeId: this.nodeId,
      elements: Array.from(this.elements.entries()).map(([k, v]) => [k, Array.from(v)]),
      removed: Array.from(this.removed),
      tagCounter: this.tagCounter,
    };
  }
}

/**
 * LWW-Register (Last-Writer-Wins Register)
 * A register where the value with the highest timestamp wins
 */
export class LWWRegister<T> implements CRDT<T | undefined> {
  readonly nodeId: string;
  private _value: T | undefined;
  private _timestamp: number;

  constructor(nodeId: string, initialValue?: T) {
    this.nodeId = nodeId;
    this._value = initialValue;
    this._timestamp = initialValue !== undefined ? Date.now() : 0;
  }

  set(value: T): void {
    this._value = value;
    this._timestamp = Date.now();
  }

  get(): T | undefined {
    return this._value;
  }

  value(): T | undefined {
    return this._value;
  }

  timestamp(): number {
    return this._timestamp;
  }

  merge(other: LWWRegister<T>): void {
    if (other._timestamp > this._timestamp) {
      this._value = other._value;
      this._timestamp = other._timestamp;
    } else if (other._timestamp === this._timestamp && other.nodeId > this.nodeId) {
      // Tie-breaker: use node ID for deterministic resolution
      this._value = other._value;
    }
  }

  clone(): LWWRegister<T> {
    const cloned = new LWWRegister<T>(this.nodeId);
    cloned._value = this._value;
    cloned._timestamp = this._timestamp;
    return cloned;
  }

  toJSON(): { nodeId: string; value: T | undefined; timestamp: number } {
    return {
      nodeId: this.nodeId,
      value: this._value,
      timestamp: this._timestamp,
    };
  }

  static fromJSON<T>(json: { nodeId: string; value: T | undefined; timestamp: number }): LWWRegister<T> {
    const register = new LWWRegister<T>(json.nodeId);
    register._value = json.value;
    register._timestamp = json.timestamp;
    return register;
  }
}

/**
 * LWW-Map (Last-Writer-Wins Map)
 * A map where each key has LWW semantics
 */
export class LWWMap<K, V> implements CRDT<Map<K, V>> {
  readonly nodeId: string;
  private entries: Map<K, LWWRegister<V | null>>;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.entries = new Map();
  }

  set(key: K, value: V): void {
    let register = this.entries.get(key);
    if (!register) {
      register = new LWWRegister<V | null>(this.nodeId);
      this.entries.set(key, register);
    }
    register.set(value);
  }

  get(key: K): V | undefined {
    const register = this.entries.get(key);
    const value = register?.value();
    return value === null ? undefined : value;
  }

  delete(key: K): boolean {
    const register = this.entries.get(key);
    if (!register || register.value() === null) return false;
    register.set(null);
    return true;
  }

  has(key: K): boolean {
    const register = this.entries.get(key);
    return register !== undefined && register.value() !== null;
  }

  keys(): K[] {
    const result: K[] = [];
    for (const [key, register] of this.entries) {
      if (register.value() !== null) {
        result.push(key);
      }
    }
    return result;
  }

  value(): Map<K, V> {
    const result = new Map<K, V>();
    for (const [key, register] of this.entries) {
      const value = register.value();
      if (value !== null && value !== undefined) {
        result.set(key, value);
      }
    }
    return result;
  }

  merge(other: LWWMap<K, V>): void {
    for (const [key, otherRegister] of other.entries) {
      let localRegister = this.entries.get(key);
      if (!localRegister) {
        localRegister = new LWWRegister<V | null>(this.nodeId);
        this.entries.set(key, localRegister);
      }
      localRegister.merge(otherRegister);
    }
  }

  clone(): LWWMap<K, V> {
    const cloned = new LWWMap<K, V>(this.nodeId);
    for (const [key, register] of this.entries) {
      cloned.entries.set(key, register.clone());
    }
    return cloned;
  }

  toJSON(): { nodeId: string; entries: Array<[K, unknown]> } {
    return {
      nodeId: this.nodeId,
      entries: Array.from(this.entries.entries()).map(([k, v]) => [k, v.toJSON()]),
    };
  }
}

/**
 * MV-Register (Multi-Value Register)
 * A register that keeps all concurrent values
 */
export class MVRegister<T> implements CRDT<T[]> {
  readonly nodeId: string;
  private values: Map<string, { value: T; clock: VectorClock }>;
  private localClock: VectorClock;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.values = new Map();
    this.localClock = new VectorClock();
  }

  set(value: T): void {
    this.localClock.increment(this.nodeId);
    const id = `${this.nodeId}:${Date.now()}`;

    // Remove all values that are causally before this one
    this.values.clear();
    this.values.set(id, {
      value,
      clock: this.localClock.clone(),
    });
  }

  value(): T[] {
    return Array.from(this.values.values()).map((v) => v.value);
  }

  merge(other: MVRegister<T>): void {
    // Merge clocks
    this.localClock.merge(other.localClock);

    // Collect all values and their clocks
    const allValues = new Map(this.values);
    for (const [id, entry] of other.values) {
      allValues.set(id, entry);
    }

    // Keep only values that are not dominated by others
    this.values.clear();
    for (const [id, entry] of allValues) {
      let dominated = false;
      for (const [otherId, otherEntry] of allValues) {
        if (id !== otherId) {
          const comparison = entry.clock.compare(otherEntry.clock);
          if (comparison === 'before') {
            dominated = true;
            break;
          }
        }
      }
      if (!dominated) {
        this.values.set(id, entry);
      }
    }
  }

  clone(): MVRegister<T> {
    const cloned = new MVRegister<T>(this.nodeId);
    cloned.localClock = this.localClock.clone();
    for (const [id, entry] of this.values) {
      cloned.values.set(id, {
        value: entry.value,
        clock: entry.clock.clone(),
      });
    }
    return cloned;
  }

  toJSON(): {
    nodeId: string;
    values: Array<[string, { value: T; clock: Record<string, number> }]>;
    localClock: Record<string, number>;
  } {
    return {
      nodeId: this.nodeId,
      values: Array.from(this.values.entries()).map(([k, v]) => [
        k,
        { value: v.value, clock: v.clock.toJSON() },
      ]),
      localClock: this.localClock.toJSON(),
    };
  }
}

/**
 * CRDT Document - A composite CRDT for JSON-like documents
 */
export interface CRDTDocumentState {
  counters: Map<string, PNCounter>;
  sets: Map<string, ORSet<unknown>>;
  registers: Map<string, LWWRegister<unknown>>;
  maps: Map<string, LWWMap<string, unknown>>;
}

export class CRDTDocument implements CRDT<CRDTDocumentState> {
  readonly nodeId: string;
  private counters: Map<string, PNCounter>;
  private sets: Map<string, ORSet<unknown>>;
  private registers: Map<string, LWWRegister<unknown>>;
  private maps: Map<string, LWWMap<string, unknown>>;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.counters = new Map();
    this.sets = new Map();
    this.registers = new Map();
    this.maps = new Map();
  }

  // Counter operations
  counter(name: string): PNCounter {
    if (!this.counters.has(name)) {
      this.counters.set(name, new PNCounter(this.nodeId));
    }
    return this.counters.get(name)!;
  }

  // Set operations
  set<T>(name: string): ORSet<T> {
    if (!this.sets.has(name)) {
      this.sets.set(name, new ORSet<T>(this.nodeId) as ORSet<unknown>);
    }
    return this.sets.get(name)! as ORSet<T>;
  }

  // Register operations
  register<T>(name: string): LWWRegister<T> {
    if (!this.registers.has(name)) {
      this.registers.set(name, new LWWRegister<T>(this.nodeId) as LWWRegister<unknown>);
    }
    return this.registers.get(name)! as LWWRegister<T>;
  }

  // Map operations
  map<V>(name: string): LWWMap<string, V> {
    if (!this.maps.has(name)) {
      this.maps.set(name, new LWWMap<string, V>(this.nodeId) as LWWMap<string, unknown>);
    }
    return this.maps.get(name)! as LWWMap<string, V>;
  }

  value(): CRDTDocumentState {
    return {
      counters: new Map(this.counters),
      sets: new Map(this.sets),
      registers: new Map(this.registers),
      maps: new Map(this.maps),
    };
  }

  merge(other: CRDTDocument): void {
    // Merge counters
    for (const [name, otherCounter] of other.counters) {
      const localCounter = this.counter(name);
      localCounter.merge(otherCounter);
    }

    // Merge sets
    for (const [name, otherSet] of other.sets) {
      const localSet = this.set(name);
      localSet.merge(otherSet as ORSet<unknown>);
    }

    // Merge registers
    for (const [name, otherRegister] of other.registers) {
      const localRegister = this.register(name);
      localRegister.merge(otherRegister as LWWRegister<unknown>);
    }

    // Merge maps
    for (const [name, otherMap] of other.maps) {
      const localMap = this.map(name);
      localMap.merge(otherMap as LWWMap<string, unknown>);
    }
  }

  clone(): CRDTDocument {
    const cloned = new CRDTDocument(this.nodeId);
    for (const [name, counter] of this.counters) {
      cloned.counters.set(name, counter.clone());
    }
    for (const [name, set] of this.sets) {
      cloned.sets.set(name, set.clone());
    }
    for (const [name, register] of this.registers) {
      cloned.registers.set(name, register.clone());
    }
    for (const [name, map] of this.maps) {
      cloned.maps.set(name, map.clone());
    }
    return cloned;
  }

  toJSON(): unknown {
    return {
      nodeId: this.nodeId,
      counters: Array.from(this.counters.entries()).map(([k, v]) => [k, v.toJSON()]),
      sets: Array.from(this.sets.entries()).map(([k, v]) => [k, v.toJSON()]),
      registers: Array.from(this.registers.entries()).map(([k, v]) => [k, v.toJSON()]),
      maps: Array.from(this.maps.entries()).map(([k, v]) => [k, v.toJSON()]),
    };
  }
}
