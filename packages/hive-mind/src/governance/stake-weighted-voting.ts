/**
 * Stake-Weighted Voting - Economic stake-based voting power
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by Compound, Curve, and veCRV models.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

export enum StakeType {
  STANDARD = 'standard',
  LOCKED = 'locked',
  VESTED = 'vested',
  DELEGATED = 'delegated',
  BONDED = 'bonded'
}

export enum LockDuration {
  NONE = 0,
  ONE_MONTH = 30 * 24 * 60 * 60 * 1000,
  THREE_MONTHS = 90 * 24 * 60 * 60 * 1000,
  SIX_MONTHS = 180 * 24 * 60 * 60 * 1000,
  ONE_YEAR = 365 * 24 * 60 * 60 * 1000,
  TWO_YEARS = 730 * 24 * 60 * 60 * 1000,
  FOUR_YEARS = 1460 * 24 * 60 * 60 * 1000
}

export interface StakePosition {
  id: string;
  owner: NodeId;
  amount: number;
  type: StakeType;
  lockedUntil?: number;
  lockDuration: LockDuration;
  multiplier: number;
  votingPower: number;
  createdAt: number;
  lastUpdated: number;
  delegatedTo?: NodeId;
  vestingSchedule?: VestingSchedule;
}

export interface VestingSchedule {
  totalAmount: number;
  vestedAmount: number;
  startTime: number;
  cliffDuration: number;
  vestingDuration: number;
  vestingInterval: number;
}

export interface StakeSnapshot {
  nodeId: NodeId;
  totalStake: number;
  effectiveVotingPower: number;
  positions: StakePosition[];
  delegatedIn: number;
  delegatedOut: number;
  timestamp: number;
}

export interface StakeEvents {
  'stake:deposited': (position: StakePosition) => void;
  'stake:withdrawn': (position: StakePosition) => void;
  'stake:locked': (position: StakePosition, duration: LockDuration) => void;
  'stake:unlocked': (position: StakePosition) => void;
  'delegation:created': (from: NodeId, to: NodeId, amount: number) => void;
  'delegation:revoked': (from: NodeId, to: NodeId, amount: number) => void;
}

export interface StakeConfig {
  minStake: number;
  maxStake: number;
  lockMultipliers: Record<LockDuration, number>;
  stakingEnabled: boolean;
  cooldownPeriod: number;
  slashingEnabled: boolean;
  maxSlashPercentage: number;
}

const DEFAULT_CONFIG: StakeConfig = {
  minStake: 1,
  maxStake: 1000000,
  lockMultipliers: {
    [LockDuration.NONE]: 1.0,
    [LockDuration.ONE_MONTH]: 1.25,
    [LockDuration.THREE_MONTHS]: 1.5,
    [LockDuration.SIX_MONTHS]: 2.0,
    [LockDuration.ONE_YEAR]: 2.5,
    [LockDuration.TWO_YEARS]: 3.0,
    [LockDuration.FOUR_YEARS]: 4.0
  },
  stakingEnabled: true,
  cooldownPeriod: 7 * 24 * 60 * 60 * 1000,
  slashingEnabled: true,
  maxSlashPercentage: 0.5
};

export class StakeWeightedVoting extends EventEmitter<StakeEvents> {
  private config: StakeConfig;
  private positions: Map<string, StakePosition> = new Map();
  private nodePositions: Map<NodeId, Set<string>> = new Map();
  private delegations: Map<string, { amount: number; to: NodeId }> = new Map();

  constructor(config: Partial<StakeConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  deposit(owner: NodeId, amount: number, lockDuration: LockDuration = LockDuration.NONE): StakePosition | null {
    if (!this.config.stakingEnabled) return null;
    if (amount < this.config.minStake || amount > this.config.maxStake) return null;

    const now = Date.now();
    const multiplier = this.config.lockMultipliers[lockDuration] || 1;

    const position: StakePosition = {
      id: this.generateId(),
      owner,
      amount,
      type: lockDuration === LockDuration.NONE ? StakeType.STANDARD : StakeType.LOCKED,
      lockedUntil: lockDuration > 0 ? now + lockDuration : undefined,
      lockDuration,
      multiplier,
      votingPower: amount * multiplier,
      createdAt: now,
      lastUpdated: now
    };

    this.positions.set(position.id, position);
    this.addToNodePositions(owner, position.id);
    this.emit('stake:deposited', position);

    if (lockDuration > 0) {
      this.emit('stake:locked', position, lockDuration);
    }

    return position;
  }

  withdraw(positionId: string, owner: NodeId): StakePosition | null {
    const position = this.positions.get(positionId);
    if (!position || position.owner !== owner) return null;

    const now = Date.now();
    if (position.lockedUntil && now < position.lockedUntil) return null;
    if (position.delegatedTo) return null;

    this.positions.delete(positionId);
    this.removeFromNodePositions(owner, positionId);
    this.emit('stake:withdrawn', position);
    return position;
  }

  extendLock(positionId: string, owner: NodeId, newDuration: LockDuration): boolean {
    const position = this.positions.get(positionId);
    if (!position || position.owner !== owner) return false;
    if (newDuration <= position.lockDuration) return false;

    const now = Date.now();
    position.lockDuration = newDuration;
    position.lockedUntil = now + newDuration;
    position.multiplier = this.config.lockMultipliers[newDuration] || 1;
    position.votingPower = position.amount * position.multiplier;
    position.type = StakeType.LOCKED;
    position.lastUpdated = now;

    this.emit('stake:locked', position, newDuration);
    return true;
  }

  delegate(positionId: string, owner: NodeId, to: NodeId): boolean {
    const position = this.positions.get(positionId);
    if (!position || position.owner !== owner) return false;
    if (position.delegatedTo) return false;
    if (owner === to) return false;

    position.delegatedTo = to;
    position.type = StakeType.DELEGATED;
    position.lastUpdated = Date.now();

    const delegationKey = `${owner}:${positionId}`;
    this.delegations.set(delegationKey, { amount: position.votingPower, to });

    this.emit('delegation:created', owner, to, position.votingPower);
    return true;
  }

  undelegate(positionId: string, owner: NodeId): boolean {
    const position = this.positions.get(positionId);
    if (!position || position.owner !== owner) return false;
    if (!position.delegatedTo) return false;

    const to = position.delegatedTo;
    const delegationKey = `${owner}:${positionId}`;

    this.delegations.delete(delegationKey);
    position.delegatedTo = undefined;
    position.type = position.lockedUntil ? StakeType.LOCKED : StakeType.STANDARD;
    position.lastUpdated = Date.now();

    this.emit('delegation:revoked', owner, to, position.votingPower);
    return true;
  }

  slash(nodeId: NodeId, percentage: number, reason: string): number {
    if (!this.config.slashingEnabled) return 0;
    const slashPercentage = Math.min(percentage, this.config.maxSlashPercentage);

    const nodePositionIds = this.nodePositions.get(nodeId);
    if (!nodePositionIds) return 0;

    let totalSlashed = 0;
    for (const positionId of nodePositionIds) {
      const position = this.positions.get(positionId);
      if (position) {
        const slashAmount = position.amount * slashPercentage;
        position.amount -= slashAmount;
        position.votingPower = position.amount * position.multiplier;
        position.lastUpdated = Date.now();
        totalSlashed += slashAmount;
      }
    }

    return totalSlashed;
  }

  getVotingPower(nodeId: NodeId): number {
    let power = 0;
    const nodePositionIds = this.nodePositions.get(nodeId);

    if (nodePositionIds) {
      for (const positionId of nodePositionIds) {
        const position = this.positions.get(positionId);
        if (position && !position.delegatedTo) {
          power += position.votingPower;
        }
      }
    }

    for (const delegation of this.delegations.values()) {
      if (delegation.to === nodeId) {
        power += delegation.amount;
      }
    }

    return power;
  }

  getStakeSnapshot(nodeId: NodeId): StakeSnapshot {
    const nodePositionIds = this.nodePositions.get(nodeId) || new Set();
    const positions: StakePosition[] = [];
    let totalStake = 0;
    let delegatedOut = 0;

    for (const positionId of nodePositionIds) {
      const position = this.positions.get(positionId);
      if (position) {
        positions.push(position);
        totalStake += position.amount;
        if (position.delegatedTo) {
          delegatedOut += position.votingPower;
        }
      }
    }

    let delegatedIn = 0;
    for (const delegation of this.delegations.values()) {
      if (delegation.to === nodeId) {
        delegatedIn += delegation.amount;
      }
    }

    return {
      nodeId,
      totalStake,
      effectiveVotingPower: this.getVotingPower(nodeId),
      positions,
      delegatedIn,
      delegatedOut,
      timestamp: Date.now()
    };
  }

  getPosition(positionId: string): StakePosition | undefined {
    return this.positions.get(positionId);
  }

  getPositionsByOwner(owner: NodeId): StakePosition[] {
    const positionIds = this.nodePositions.get(owner);
    if (!positionIds) return [];

    return Array.from(positionIds)
      .map(id => this.positions.get(id))
      .filter((p): p is StakePosition => p !== undefined);
  }

  getTotalStaked(): number {
    let total = 0;
    for (const position of this.positions.values()) {
      total += position.amount;
    }
    return total;
  }

  getTotalVotingPower(): number {
    let total = 0;
    for (const position of this.positions.values()) {
      total += position.votingPower;
    }
    return total;
  }

  private addToNodePositions(nodeId: NodeId, positionId: string): void {
    let positions = this.nodePositions.get(nodeId);
    if (!positions) {
      positions = new Set();
      this.nodePositions.set(nodeId, positions);
    }
    positions.add(positionId);
  }

  private removeFromNodePositions(nodeId: NodeId, positionId: string): void {
    const positions = this.nodePositions.get(nodeId);
    if (positions) {
      positions.delete(positionId);
      if (positions.size === 0) {
        this.nodePositions.delete(nodeId);
      }
    }
  }

  private generateId(): string {
    return `stake_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default StakeWeightedVoting;
