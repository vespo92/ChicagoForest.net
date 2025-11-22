/**
 * Proposal Templates - Pre-defined proposal types
 */

import type { NodeId } from '@chicago-forest/shared-types';
import type { Proposal, ProposalType } from '../types';

/**
 * Factory for creating common proposal types
 */
export class ProposalFactory {
  private localNodeId: NodeId;

  constructor(localNodeId: NodeId) {
    this.localNodeId = localNodeId;
  }

  /**
   * Create a protocol upgrade proposal
   */
  createProtocolUpgrade(
    version: string,
    changes: string[],
    upgradeDate: number
  ): Proposal {
    return this.createBase('protocol', {
      title: `Protocol Upgrade to v${version}`,
      description: `Upgrade the network protocol to version ${version}.\n\nChanges:\n${changes.map(c => `- ${c}`).join('\n')}`,
      quorum: 0.4,
      threshold: 0.67,
      duration: 14 * 24 * 60 * 60 * 1000, // 14 days
      payload: { version, changes, upgradeDate },
      tags: ['protocol', 'upgrade'],
    });
  }

  /**
   * Create a resource allocation proposal
   */
  createResourceAllocation(
    resourceType: string,
    amount: number,
    recipient: NodeId,
    reason: string
  ): Proposal {
    return this.createBase('resource', {
      title: `Allocate ${amount} ${resourceType} to ${recipient.slice(0, 8)}...`,
      description: `Proposal to allocate ${amount} ${resourceType} to node ${recipient}.\n\nReason: ${reason}`,
      quorum: 0.2,
      threshold: 0.5,
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      payload: { resourceType, amount, recipient },
      tags: ['resource', resourceType],
    });
  }

  /**
   * Create a governance rule change proposal
   */
  createGovernanceChange(
    rule: string,
    oldValue: unknown,
    newValue: unknown,
    rationale: string
  ): Proposal {
    return this.createBase('governance', {
      title: `Change governance rule: ${rule}`,
      description: `Proposal to change ${rule} from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}.\n\nRationale: ${rationale}`,
      quorum: 0.3,
      threshold: 0.67,
      duration: 14 * 24 * 60 * 60 * 1000, // 14 days
      payload: { rule, oldValue, newValue },
      tags: ['governance', 'rules'],
    });
  }

  /**
   * Create a membership proposal (add/remove node)
   */
  createMembershipChange(
    action: 'add' | 'remove',
    targetNode: NodeId,
    reason: string
  ): Proposal {
    const actionVerb = action === 'add' ? 'Add' : 'Remove';
    return this.createBase('membership', {
      title: `${actionVerb} node ${targetNode.slice(0, 8)}...`,
      description: `Proposal to ${action} node ${targetNode} from the network.\n\nReason: ${reason}`,
      quorum: 0.25,
      threshold: action === 'remove' ? 0.67 : 0.5,
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      payload: { action, targetNode },
      tags: ['membership', action],
    });
  }

  /**
   * Create an emergency proposal
   */
  createEmergency(
    action: string,
    justification: string,
    expiresIn: number = 24 * 60 * 60 * 1000
  ): Proposal {
    return this.createBase('emergency', {
      title: `EMERGENCY: ${action}`,
      description: `Emergency action required: ${action}\n\nJustification: ${justification}\n\n⚠️ This is an emergency proposal with expedited voting.`,
      quorum: 0.1,
      threshold: 0.5,
      duration: expiresIn,
      payload: { action, emergency: true },
      tags: ['emergency', 'urgent'],
    });
  }

  /**
   * Create a federation proposal
   */
  createFederationProposal(
    targetForest: string,
    terms: unknown
  ): Proposal {
    return this.createBase('custom', {
      title: `Federate with ${targetForest}`,
      description: `Proposal to establish federation with forest: ${targetForest}`,
      quorum: 0.3,
      threshold: 0.6,
      duration: 7 * 24 * 60 * 60 * 1000,
      payload: { targetForest, terms, type: 'federation' },
      tags: ['federation', 'symbiosis'],
    });
  }

  /**
   * Create a spending proposal
   */
  createSpendingProposal(
    amount: number,
    purpose: string,
    recipient: string
  ): Proposal {
    return this.createBase('resource', {
      title: `Spend ${amount} credits: ${purpose}`,
      description: `Proposal to spend ${amount} credits on: ${purpose}\n\nRecipient: ${recipient}`,
      quorum: 0.2,
      threshold: 0.5,
      duration: 7 * 24 * 60 * 60 * 1000,
      payload: { amount, purpose, recipient, type: 'spending' },
      tags: ['spending', 'credits'],
    });
  }

  // Private helper

  private createBase(
    type: ProposalType,
    options: {
      title: string;
      description: string;
      quorum: number;
      threshold: number;
      duration: number;
      payload: unknown;
      tags: string[];
    }
  ): Proposal {
    const now = Date.now();
    return {
      id: `prop_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      title: options.title,
      description: options.description,
      proposer: this.localNodeId,
      createdAt: now,
      deadline: now + options.duration,
      quorum: options.quorum,
      threshold: options.threshold,
      status: 'draft',
      payload: options.payload,
      tags: options.tags,
    };
  }
}

export { Proposal, ProposalType };
