/**
 * ConstitutionalShrinkage Mock
 *
 * Mock implementation for ConstitutionalShrinkage governance bridge integration testing.
 * Simulates proposal submission, voting, and regional pod coordination.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

// ============================================================================
// ConstitutionalShrinkage Types (mirroring expected ConShrink interface)
// ============================================================================

export interface GovernanceProposal {
  id?: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'policy' | 'budget' | 'membership' | 'emergency';
  proposer: NodeId;
  requiredQuorum: number;
  votingPeriod: number; // in seconds
  payload: unknown;
}

export interface ConShrinkBill {
  billId: string;
  proposalId: string;
  status: 'draft' | 'submitted' | 'voting' | 'passed' | 'rejected' | 'vetoed';
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  submittedAt: number;
  expiresAt: number;
}

export interface EncryptedVote {
  billId: string;
  voterCommitment: string; // Zero-knowledge commitment
  encryptedChoice: Uint8Array;
  proof: string;
}

export interface VoteReceipt {
  receiptId: string;
  billId: string;
  accepted: boolean;
  timestamp: number;
  blockHeight?: number;
}

export type RegionId = string;

export interface RegionState {
  regionId: RegionId;
  activeNodes: NodeId[];
  delegateNode: NodeId | null;
  activeBills: string[];
  lastSync: number;
}

export interface ConShrinkEvents {
  'proposal:submitted': (bill: ConShrinkBill) => void;
  'vote:cast': (receipt: VoteReceipt) => void;
  'bill:passed': (bill: ConShrinkBill) => void;
  'bill:rejected': (bill: ConShrinkBill) => void;
  'region:synced': (state: RegionState) => void;
  'error': (error: Error) => void;
}

// ============================================================================
// Mock Constitutional Shrinkage Bridge
// ============================================================================

export class MockConShrinkBridge extends EventEmitter<ConShrinkEvents> {
  private connected = false;
  private bills: Map<string, ConShrinkBill> = new Map();
  private votes: Map<string, VoteReceipt[]> = new Map();
  private regions: Map<RegionId, RegionState> = new Map();
  private processingDelay: number;
  private autoPassRate: number;

  constructor(options: { processingDelay?: number; autoPassRate?: number } = {}) {
    super();
    this.processingDelay = options.processingDelay ?? 50;
    this.autoPassRate = options.autoPassRate ?? 0.8; // 80% pass rate by default
  }

  async connect(): Promise<void> {
    this.connected = true;
    // Initialize some test regions
    this.initializeTestRegions();
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.bills.clear();
    this.votes.clear();
    this.regions.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Submit a governance proposal to ConstitutionalShrinkage
   */
  async submitProposal(proposal: GovernanceProposal): Promise<string> {
    if (!this.connected) {
      throw new Error('ConShrink bridge not connected');
    }

    await this.delay(this.processingDelay);

    const billId = `BILL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const proposalId = proposal.id ?? `PROP-${Date.now()}`;

    const bill: ConShrinkBill = {
      billId,
      proposalId,
      status: 'submitted',
      votes: { for: 0, against: 0, abstain: 0 },
      submittedAt: Date.now(),
      expiresAt: Date.now() + proposal.votingPeriod * 1000,
    };

    this.bills.set(billId, bill);
    this.votes.set(billId, []);
    this.emit('proposal:submitted', bill);

    return billId;
  }

  /**
   * Translate a Forest proposal to ConShrink bill format
   */
  translateProposal(forestProposal: GovernanceProposal): ConShrinkBill {
    return {
      billId: `BILL-pending`,
      proposalId: forestProposal.id ?? 'unknown',
      status: 'draft',
      votes: { for: 0, against: 0, abstain: 0 },
      submittedAt: 0,
      expiresAt: 0,
    };
  }

  /**
   * Route a vote through the anonymous network
   */
  async routeVote(vote: EncryptedVote): Promise<VoteReceipt> {
    if (!this.connected) {
      throw new Error('ConShrink bridge not connected');
    }

    const bill = this.bills.get(vote.billId);
    if (!bill) {
      throw new Error(`Bill not found: ${vote.billId}`);
    }

    await this.delay(this.processingDelay);

    const receipt: VoteReceipt = {
      receiptId: `RCPT-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      billId: vote.billId,
      accepted: true,
      timestamp: Date.now(),
      blockHeight: 1000 + Math.floor(Math.random() * 100),
    };

    // Simulate vote counting (random for mock)
    const voteChoice = Math.random();
    if (voteChoice < 0.6) {
      bill.votes.for++;
    } else if (voteChoice < 0.9) {
      bill.votes.against++;
    } else {
      bill.votes.abstain++;
    }

    const receipts = this.votes.get(vote.billId) ?? [];
    receipts.push(receipt);
    this.votes.set(vote.billId, receipts);

    this.emit('vote:cast', receipt);
    return receipt;
  }

  /**
   * Sync voting results between Forest and ConShrink
   */
  async syncVotingResults(billId: string): Promise<ConShrinkBill> {
    if (!this.connected) {
      throw new Error('ConShrink bridge not connected');
    }

    const bill = this.bills.get(billId);
    if (!bill) {
      throw new Error(`Bill not found: ${billId}`);
    }

    await this.delay(this.processingDelay);

    // Simulate vote finalization
    if (bill.status === 'voting' || bill.status === 'submitted') {
      const totalVotes = bill.votes.for + bill.votes.against + bill.votes.abstain;
      if (totalVotes > 0 && bill.votes.for / totalVotes > 0.5) {
        bill.status = 'passed';
        this.emit('bill:passed', bill);
      } else if (Date.now() > bill.expiresAt) {
        bill.status = 'rejected';
        this.emit('bill:rejected', bill);
      }
    }

    return bill;
  }

  /**
   * Get regional state for pod coordination
   */
  async syncRegionalData(regionId: RegionId): Promise<RegionState> {
    if (!this.connected) {
      throw new Error('ConShrink bridge not connected');
    }

    await this.delay(this.processingDelay);

    let region = this.regions.get(regionId);
    if (!region) {
      region = this.createTestRegion(regionId);
      this.regions.set(regionId, region);
    }

    region.lastSync = Date.now();
    this.emit('region:synced', region);
    return region;
  }

  /**
   * Coordinate nodes within a regional pod
   */
  async coordinateRegionalNodes(regionId: RegionId): Promise<NodeId[]> {
    const region = await this.syncRegionalData(regionId);
    return region.activeNodes;
  }

  /**
   * Get a bill by ID
   */
  getBill(billId: string): ConShrinkBill | undefined {
    return this.bills.get(billId);
  }

  /**
   * Get all bills
   */
  getAllBills(): ConShrinkBill[] {
    return Array.from(this.bills.values());
  }

  /**
   * Get votes for a bill
   */
  getVotesForBill(billId: string): VoteReceipt[] {
    return this.votes.get(billId) ?? [];
  }

  /**
   * Get all regions
   */
  getAllRegions(): RegionState[] {
    return Array.from(this.regions.values());
  }

  /**
   * Simulate bill outcome (for testing)
   */
  simulateBillOutcome(billId: string, passed: boolean): void {
    const bill = this.bills.get(billId);
    if (bill) {
      bill.status = passed ? 'passed' : 'rejected';
      if (passed) {
        this.emit('bill:passed', bill);
      } else {
        this.emit('bill:rejected', bill);
      }
    }
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.bills.clear();
    this.votes.clear();
    this.regions.clear();
    this.removeAllListeners();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private initializeTestRegions(): void {
    const testRegions = ['chicago-north', 'chicago-south', 'chicago-west', 'chicago-central'];
    for (const regionId of testRegions) {
      this.regions.set(regionId, this.createTestRegion(regionId));
    }
  }

  private createTestRegion(regionId: RegionId): RegionState {
    const nodeCount = 3 + Math.floor(Math.random() * 5);
    return {
      regionId,
      activeNodes: Array.from({ length: nodeCount }, (_, i) => `CFN-${regionId}-node-${i}`),
      delegateNode: `CFN-${regionId}-delegate`,
      activeBills: [],
      lastSync: Date.now(),
    };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createMockConShrink(
  options?: { processingDelay?: number; autoPassRate?: number }
): MockConShrinkBridge {
  return new MockConShrinkBridge(options);
}

export function createTestProposal(
  overrides: Partial<GovernanceProposal> = {}
): GovernanceProposal {
  return {
    title: 'Test Proposal',
    description: 'A test governance proposal',
    category: 'infrastructure',
    proposer: 'CFN-test-proposer',
    requiredQuorum: 0.5,
    votingPeriod: 86400, // 24 hours
    payload: { action: 'test' },
    ...overrides,
  };
}

export function createTestEncryptedVote(
  billId: string,
  overrides: Partial<EncryptedVote> = {}
): EncryptedVote {
  return {
    billId,
    voterCommitment: `commitment-${Math.random().toString(36).slice(2)}`,
    encryptedChoice: new Uint8Array([1, 2, 3, 4]),
    proof: `proof-${Math.random().toString(36).slice(2)}`,
    ...overrides,
  };
}
