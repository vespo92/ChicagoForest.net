/**
 * DataSynchronizer Tests
 *
 * Tests for the main synchronization engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataSynchronizer, type Change } from '../src';

describe('DataSynchronizer', () => {
  let sync: DataSynchronizer;

  beforeEach(() => {
    sync = new DataSynchronizer({
      nodeId: 'test-node',
      peers: ['peer1', 'peer2'],
      enableCRDT: true,
      enableAntiEntropy: false, // Disable for unit tests
      enablePartitionDetection: false,
    });
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      sync.set('key1', 'value1');
      expect(sync.get('key1')).toBe('value1');
    });

    it('should delete values', () => {
      sync.set('key1', 'value1');
      sync.delete('key1');
      expect(sync.get('key1')).toBeUndefined();
    });

    it('should track pending changes', () => {
      sync.set('key1', 'value1');
      sync.set('key2', 'value2');

      const pending = sync.getPendingChanges();
      expect(pending).toHaveLength(2);
      expect(pending[0].key).toBe('key1');
      expect(pending[1].key).toBe('key2');
    });

    it('should clear pending changes', () => {
      sync.set('key1', 'value1');
      expect(sync.getPendingChanges()).toHaveLength(1);

      sync.clearPendingChanges();
      expect(sync.getPendingChanges()).toHaveLength(0);
    });

    it('should return entry count', () => {
      sync.set('key1', 'value1');
      sync.set('key2', 'value2');
      expect(sync.size()).toBe(2);
    });

    it('should check if key exists', () => {
      sync.set('key1', 'value1');
      expect(sync.has('key1')).toBe(true);
      expect(sync.has('key2')).toBe(false);
    });

    it('should return all keys', () => {
      sync.set('a', 1);
      sync.set('b', 2);
      sync.set('c', 3);
      expect(sync.keys().sort()).toEqual(['a', 'b', 'c']);
    });

    it('should clear all data', () => {
      sync.set('key1', 'value1');
      sync.set('key2', 'value2');
      sync.clear();
      expect(sync.size()).toBe(0);
      expect(sync.getPendingChanges()).toHaveLength(0);
    });
  });

  describe('Change Operations', () => {
    it('should create change with correct operation type', () => {
      const createChange = sync.set('newKey', 'value');
      expect(createChange.operation).toBe('create');

      const updateChange = sync.set('newKey', 'updated');
      expect(updateChange.operation).toBe('update');
    });

    it('should include previous value in update changes', () => {
      sync.set('key1', 'original');
      const change = sync.set('key1', 'updated');

      expect(change.previousValue).toBe('original');
      expect(change.value).toBe('updated');
    });

    it('should apply remote changes', () => {
      const remoteChange: Change = {
        id: 'remote-1',
        nodeId: 'peer1',
        timestamp: Date.now(),
        operation: 'create',
        key: 'remoteKey',
        value: 'remoteValue',
      };

      const applied = sync.applyChange(remoteChange);
      expect(applied).toBe(true);
      expect(sync.get('remoteKey')).toBe('remoteValue');
    });

    it('should apply delete changes', () => {
      sync.set('key1', 'value1');

      const deleteChange: Change = {
        id: 'remote-2',
        nodeId: 'peer1',
        timestamp: Date.now(),
        operation: 'delete',
        key: 'key1',
      };

      sync.applyChange(deleteChange);
      expect(sync.get('key1')).toBeUndefined();
    });
  });

  describe('Sync State', () => {
    it('should start in synced state', () => {
      const state = sync.getState();
      expect(state.status).toBe('synced');
    });

    it('should change to ahead after local change', () => {
      sync.set('key1', 'value1');
      expect(sync.getState().status).toBe('ahead');
    });

    it('should track node ID', () => {
      expect(sync.getState().nodeId).toBe('test-node');
    });

    it('should track last sync time', () => {
      const before = new Date();
      sync.clearPendingChanges();
      const after = new Date();

      const lastSync = sync.getState().lastSync;
      expect(lastSync.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(lastSync.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Events', () => {
    it('should emit change:local on set', () => {
      const listener = vi.fn();
      sync.on('change:local', listener);

      sync.set('key1', 'value1');

      expect(listener).toHaveBeenCalledOnce();
      expect(listener.mock.calls[0][0].key).toBe('key1');
    });

    it('should emit change:remote on apply', () => {
      const listener = vi.fn();
      sync.on('change:remote', listener);

      sync.applyChange({
        id: 'remote-1',
        nodeId: 'peer1',
        timestamp: Date.now(),
        operation: 'create',
        key: 'key1',
        value: 'value1',
      });

      expect(listener).toHaveBeenCalledOnce();
    });

    it('should emit status:changed on status change', () => {
      const listener = vi.fn();
      sync.on('status:changed', listener);

      sync.set('key1', 'value1'); // synced -> ahead

      expect(listener).toHaveBeenCalledWith('synced', 'ahead');
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts with last-write-wins by default', () => {
      sync.set('key1', 'local');

      // Apply older remote change
      const oldChange: Change = {
        id: 'remote-1',
        nodeId: 'peer1',
        timestamp: Date.now() - 10000, // 10 seconds ago
        operation: 'create',
        key: 'key1',
        value: 'remote-old',
      };

      sync.applyChange(oldChange);
      expect(sync.get('key1')).toBe('local'); // Local wins (newer)
    });

    it('should emit conflict events', () => {
      const conflictListener = vi.fn();
      const resolvedListener = vi.fn();
      sync.on('conflict:detected', conflictListener);
      sync.on('conflict:resolved', resolvedListener);

      sync.set('key1', 'local');

      sync.applyChange({
        id: 'remote-1',
        nodeId: 'peer1',
        timestamp: Date.now() - 1000,
        operation: 'create',
        key: 'key1',
        value: 'remote',
      });

      expect(conflictListener).toHaveBeenCalled();
      expect(resolvedListener).toHaveBeenCalled();
    });
  });

  describe('CRDT Integration', () => {
    it('should provide access to CRDT document', () => {
      const crdt = sync.crdt();
      expect(crdt).toBeDefined();
    });

    it('should provide counter access', () => {
      const counter = sync.counter('visits');
      counter.increment(5);
      expect(counter.value()).toBe(5);
    });

    it('should provide OR-Set access', () => {
      const set = sync.orSet<string>('tags');
      set.add('typescript');
      expect(set.has('typescript')).toBe(true);
    });

    it('should provide LWW-Map access', () => {
      const map = sync.lwwMap<number>('scores');
      map.set('player1', 100);
      expect(map.get('player1')).toBe(100);
    });

    it('should throw if CRDT disabled', () => {
      const noCrdtSync = new DataSynchronizer({
        nodeId: 'test',
        enableCRDT: false,
        enableAntiEntropy: false,
        enablePartitionDetection: false,
      });

      expect(() => noCrdtSync.crdt()).toThrow();
    });
  });

  describe('Entries', () => {
    it('should return all entries', () => {
      sync.set('a', 1);
      sync.set('b', 2);

      const entries = sync.entries();
      expect(entries).toHaveLength(2);
      expect(entries.map(e => e.key).sort()).toEqual(['a', 'b']);
    });

    it('should include version in entries', () => {
      sync.set('key1', 'value1');
      const entries = sync.entries();
      expect(entries[0].version).toBeGreaterThan(0);
    });
  });
});

describe('DataSynchronizer - First Write Wins', () => {
  it('should keep first value on conflict', () => {
    const sync = new DataSynchronizer({
      nodeId: 'test-node',
      conflictResolution: { strategy: 'first-write-wins' },
      enableCRDT: false,
      enableAntiEntropy: false,
      enablePartitionDetection: false,
    });

    sync.set('key1', 'first');

    sync.applyChange({
      id: 'remote-1',
      nodeId: 'peer1',
      timestamp: Date.now() + 10000, // Even if newer
      operation: 'create',
      key: 'key1',
      value: 'second',
    });

    expect(sync.get('key1')).toBe('first');
  });
});

describe('DataSynchronizer - Custom Merge', () => {
  it('should use custom merge function', () => {
    const sync = new DataSynchronizer({
      nodeId: 'test-node',
      conflictResolution: {
        strategy: 'merge',
        resolver: (a, b) => ({
          ...a,
          value: `${a.value}+${b.value}`,
          timestamp: Math.max(a.timestamp, b.timestamp),
        }),
      },
      enableCRDT: false,
      enableAntiEntropy: false,
      enablePartitionDetection: false,
    });

    sync.set('key1', 'local');

    sync.applyChange({
      id: 'remote-1',
      nodeId: 'peer1',
      timestamp: Date.now(),
      operation: 'create',
      key: 'key1',
      value: 'remote',
    });

    expect(sync.get('key1')).toContain('local');
    expect(sync.get('key1')).toContain('remote');
  });
});
