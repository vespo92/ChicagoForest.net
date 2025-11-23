/**
 * Delegation - Liquid democracy implementation
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by Aragon Govern, Snapshot delegation, and liquid democracy models.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

export enum DelegationType {
  FULL = 'full',
  PARTIAL = 'partial',
  TOPIC_SPECIFIC = 'topic_specific',
  TIME_LIMITED = 'time_limited',
  CONDITIONAL = 'conditional'
}

export enum DelegationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

export interface Delegation {
  id: string;
  from: NodeId;
  to: NodeId;
  type: DelegationType;
  status: DelegationStatus;
  percentage: number;
  topics: string[];
  conditions?: DelegationCondition[];
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  lastUsedAt?: number;
}

export interface DelegationCondition {
  type: 'proposal_type' | 'impact_level' | 'amount_threshold' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: unknown;
}

export interface DelegationChain {
  origin: NodeId;
  chain: NodeId[];
  effectiveWeight: number;
  depth: number;
  topics: string[];
}

export interface DelegationStats {
  nodeId: NodeId;
  delegatedOutCount: number;
  delegatedOutPercentage: number;
  delegatedInCount: number;
  delegatedInWeight: number;
  isDelegate: boolean;
  delegatorCount: number;
  effectiveVotingPower: number;
}

export interface DelegationEvents {
  'delegation:created': (delegation: Delegation) => void;
  'delegation:updated': (delegation: Delegation) => void;
  'delegation:revoked': (delegation: Delegation) => void;
  'delegation:used': (delegationId: string, proposalId: string) => void;
  'delegation:expired': (delegation: Delegation) => void;
}

export interface DelegationConfig {
  maxChainDepth: number;
  maxDelegationsFrom: number;
  maxDelegationsTo: number;
  minDelegationPercentage: number;
  allowSelfDelegation: boolean;
  allowCircularDelegation: boolean;
  defaultExpiration: number;
  requireTopics: boolean;
}

const DEFAULT_CONFIG: DelegationConfig = {
  maxChainDepth: 5,
  maxDelegationsFrom: 10,
  maxDelegationsTo: 100,
  minDelegationPercentage: 1,
  allowSelfDelegation: false,
  allowCircularDelegation: false,
  defaultExpiration: 365 * 24 * 60 * 60 * 1000,
  requireTopics: false
};

export class DelegationSystem extends EventEmitter<DelegationEvents> {
  private config: DelegationConfig;
  private delegations: Map<string, Delegation> = new Map();
  private delegationsFrom: Map<NodeId, Set<string>> = new Map();
  private delegationsTo: Map<NodeId, Set<string>> = new Map();

  constructor(config: Partial<DelegationConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  createDelegation(
    from: NodeId,
    to: NodeId,
    type: DelegationType,
    percentage: number,
    topics: string[] = [],
    expiresAt?: number
  ): Delegation | null {
    if (!this.config.allowSelfDelegation && from === to) {
      return null;
    }

    if (percentage < this.config.minDelegationPercentage || percentage > 100) {
      return null;
    }

    const fromDelegations = this.delegationsFrom.get(from);
    if (fromDelegations && fromDelegations.size >= this.config.maxDelegationsFrom) {
      return null;
    }

    const toDelegations = this.delegationsTo.get(to);
    if (toDelegations && toDelegations.size >= this.config.maxDelegationsTo) {
      return null;
    }

    const totalDelegated = this.getTotalDelegatedPercentage(from);
    if (totalDelegated + percentage > 100) {
      return null;
    }

    if (!this.config.allowCircularDelegation && this.wouldCreateCycle(from, to)) {
      return null;
    }

    if (this.config.requireTopics && topics.length === 0) {
      return null;
    }

    const now = Date.now();
    const delegation: Delegation = {
      id: this.generateId(),
      from,
      to,
      type,
      status: DelegationStatus.ACTIVE,
      percentage,
      topics,
      expiresAt: expiresAt || (now + this.config.defaultExpiration),
      createdAt: now,
      updatedAt: now,
      usageCount: 0
    };

    this.delegations.set(delegation.id, delegation);
    this.addToDelegationsFrom(from, delegation.id);
    this.addToDelegationsTo(to, delegation.id);

    this.emit('delegation:created', delegation);
    return delegation;
  }

  updateDelegation(
    delegationId: string,
    owner: NodeId,
    updates: Partial<Pick<Delegation, 'percentage' | 'topics' | 'expiresAt' | 'status'>>
  ): Delegation | null {
    const delegation = this.delegations.get(delegationId);
    if (!delegation || delegation.from !== owner) {
      return null;
    }

    if (updates.percentage !== undefined) {
      const otherDelegated = this.getTotalDelegatedPercentage(owner) - delegation.percentage;
      if (otherDelegated + updates.percentage > 100) {
        return null;
      }
      delegation.percentage = updates.percentage;
    }

    if (updates.topics !== undefined) {
      delegation.topics = updates.topics;
    }

    if (updates.expiresAt !== undefined) {
      delegation.expiresAt = updates.expiresAt;
    }

    if (updates.status !== undefined) {
      delegation.status = updates.status;
    }

    delegation.updatedAt = Date.now();
    this.emit('delegation:updated', delegation);
    return delegation;
  }

  revokeDelegation(delegationId: string, owner: NodeId): boolean {
    const delegation = this.delegations.get(delegationId);
    if (!delegation || delegation.from !== owner) {
      return false;
    }

    delegation.status = DelegationStatus.REVOKED;
    delegation.updatedAt = Date.now();

    this.removeFromDelegationsFrom(delegation.from, delegationId);
    this.removeFromDelegationsTo(delegation.to, delegationId);

    this.emit('delegation:revoked', delegation);
    return true;
  }

  recordDelegationUsage(delegationId: string, proposalId: string): boolean {
    const delegation = this.delegations.get(delegationId);
    if (!delegation || delegation.status !== DelegationStatus.ACTIVE) {
      return false;
    }

    delegation.usageCount++;
    delegation.lastUsedAt = Date.now();
    this.emit('delegation:used', delegationId, proposalId);
    return true;
  }

  getDelegation(delegationId: string): Delegation | undefined {
    return this.delegations.get(delegationId);
  }

  getDelegationsFrom(nodeId: NodeId): Delegation[] {
    const ids = this.delegationsFrom.get(nodeId);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.delegations.get(id))
      .filter((d): d is Delegation => d !== undefined && d.status === DelegationStatus.ACTIVE);
  }

  getDelegationsTo(nodeId: NodeId): Delegation[] {
    const ids = this.delegationsTo.get(nodeId);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.delegations.get(id))
      .filter((d): d is Delegation => d !== undefined && d.status === DelegationStatus.ACTIVE);
  }

  resolveDelegationChain(
    origin: NodeId,
    topic?: string,
    votingPower: number = 100
  ): DelegationChain[] {
    const chains: DelegationChain[] = [];
    const visited = new Set<NodeId>();

    this.buildChains(origin, [origin], votingPower, topic, visited, chains, 0);
    return chains;
  }

  getEffectiveVotingPower(
    nodeId: NodeId,
    basePower: number,
    topic?: string
  ): number {
    let power = basePower;

    const delegationsFrom = this.getDelegationsFrom(nodeId);
    for (const delegation of delegationsFrom) {
      if (!topic || delegation.topics.length === 0 || delegation.topics.includes(topic)) {
        power -= basePower * (delegation.percentage / 100);
      }
    }

    const delegationsTo = this.getDelegationsTo(nodeId);
    for (const delegation of delegationsTo) {
      if (!topic || delegation.topics.length === 0 || delegation.topics.includes(topic)) {
        const chains = this.resolveDelegationChain(delegation.from, topic);
        for (const chain of chains) {
          if (chain.chain[chain.chain.length - 1] === nodeId) {
            power += chain.effectiveWeight;
          }
        }
      }
    }

    return Math.max(0, power);
  }

  getDelegationStats(nodeId: NodeId): DelegationStats {
    const delegationsFrom = this.getDelegationsFrom(nodeId);
    const delegationsTo = this.getDelegationsTo(nodeId);

    const delegatedOutPercentage = delegationsFrom.reduce((sum, d) => sum + d.percentage, 0);
    const delegatedInWeight = delegationsTo.reduce((sum, d) => sum + d.percentage, 0);

    const uniqueDelegators = new Set(delegationsTo.map(d => d.from));

    return {
      nodeId,
      delegatedOutCount: delegationsFrom.length,
      delegatedOutPercentage,
      delegatedInCount: delegationsTo.length,
      delegatedInWeight,
      isDelegate: delegationsTo.length > 0,
      delegatorCount: uniqueDelegators.size,
      effectiveVotingPower: this.getEffectiveVotingPower(nodeId, 100)
    };
  }

  expireOldDelegations(): Delegation[] {
    const now = Date.now();
    const expired: Delegation[] = [];

    for (const delegation of this.delegations.values()) {
      if (
        delegation.status === DelegationStatus.ACTIVE &&
        delegation.expiresAt &&
        delegation.expiresAt < now
      ) {
        delegation.status = DelegationStatus.EXPIRED;
        this.removeFromDelegationsFrom(delegation.from, delegation.id);
        this.removeFromDelegationsTo(delegation.to, delegation.id);
        expired.push(delegation);
        this.emit('delegation:expired', delegation);
      }
    }

    return expired;
  }

  private buildChains(
    current: NodeId,
    chain: NodeId[],
    weight: number,
    topic: string | undefined,
    visited: Set<NodeId>,
    chains: DelegationChain[],
    depth: number
  ): void {
    if (depth > this.config.maxChainDepth) return;
    if (visited.has(current)) return;

    visited.add(current);

    const delegations = this.getDelegationsFrom(current);
    const relevantDelegations = delegations.filter(
      d => !topic || d.topics.length === 0 || d.topics.includes(topic)
    );

    if (relevantDelegations.length === 0 && chain.length > 1) {
      chains.push({
        origin: chain[0],
        chain: [...chain],
        effectiveWeight: weight,
        depth,
        topics: topic ? [topic] : []
      });
    }

    for (const delegation of relevantDelegations) {
      const newWeight = weight * (delegation.percentage / 100);
      this.buildChains(
        delegation.to,
        [...chain, delegation.to],
        newWeight,
        topic,
        new Set(visited),
        chains,
        depth + 1
      );
    }
  }

  private wouldCreateCycle(from: NodeId, to: NodeId): boolean {
    const visited = new Set<NodeId>();
    const queue: NodeId[] = [to];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === from) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const delegations = this.getDelegationsFrom(current);
      for (const delegation of delegations) {
        queue.push(delegation.to);
      }
    }

    return false;
  }

  private getTotalDelegatedPercentage(nodeId: NodeId): number {
    const delegations = this.getDelegationsFrom(nodeId);
    return delegations.reduce((sum, d) => sum + d.percentage, 0);
  }

  private addToDelegationsFrom(nodeId: NodeId, delegationId: string): void {
    let set = this.delegationsFrom.get(nodeId);
    if (!set) {
      set = new Set();
      this.delegationsFrom.set(nodeId, set);
    }
    set.add(delegationId);
  }

  private addToDelegationsTo(nodeId: NodeId, delegationId: string): void {
    let set = this.delegationsTo.get(nodeId);
    if (!set) {
      set = new Set();
      this.delegationsTo.set(nodeId, set);
    }
    set.add(delegationId);
  }

  private removeFromDelegationsFrom(nodeId: NodeId, delegationId: string): void {
    const set = this.delegationsFrom.get(nodeId);
    if (set) {
      set.delete(delegationId);
      if (set.size === 0) this.delegationsFrom.delete(nodeId);
    }
  }

  private removeFromDelegationsTo(nodeId: NodeId, delegationId: string): void {
    const set = this.delegationsTo.get(nodeId);
    if (set) {
      set.delete(delegationId);
      if (set.size === 0) this.delegationsTo.delete(nodeId);
    }
  }

  private generateId(): string {
    return `del_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default DelegationSystem;
