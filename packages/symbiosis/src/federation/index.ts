/**
 * Federation Manager - Managing inter-forest agreements
 */

import { EventEmitter } from 'eventemitter3';
import type {
  FederationAgreement,
  FederationType,
  FederationTerms,
  AgreementStatus,
  SymbiosisEvents,
} from '../types';

/**
 * Configuration for federation management
 */
export interface FederationConfig {
  /** Local forest ID */
  localForestId: string;

  /** Minimum trust score to federate */
  minTrustScore: number;

  /** Agreement expiry warning (ms before expiry) */
  expiryWarning: number;

  /** Enable automatic agreement renewal */
  autoRenew: boolean;
}

const DEFAULT_CONFIG: FederationConfig = {
  localForestId: 'local',
  minTrustScore: 0.5,
  expiryWarning: 7 * 24 * 60 * 60 * 1000, // 7 days
  autoRenew: false,
};

/**
 * Manages federation agreements between forests
 */
export class FederationManager extends EventEmitter<SymbiosisEvents> {
  private config: FederationConfig;
  private agreements: Map<string, FederationAgreement> = new Map();
  private proposalCallbacks: Map<string, (accept: boolean) => void> = new Map();

  constructor(config: Partial<FederationConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Propose a federation with another forest
   */
  async proposeAgreement(
    targetForestId: string,
    type: FederationType,
    terms: FederationTerms
  ): Promise<FederationAgreement> {
    const agreement: FederationAgreement = {
      id: this.generateAgreementId(),
      forestA: this.config.localForestId,
      forestB: targetForestId,
      type,
      terms,
      createdAt: Date.now(),
      expiresAt: 0, // Set on acceptance
      status: 'proposed',
      signatures: {
        forestA: '', // Would be signed
        forestB: '',
      },
    };

    this.agreements.set(agreement.id, agreement);
    this.emit('federation:proposed', agreement);

    return agreement;
  }

  /**
   * Accept a proposed agreement
   */
  async acceptAgreement(
    agreementId: string,
    expiryDuration?: number
  ): Promise<boolean> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement || agreement.status !== 'proposed') {
      return false;
    }

    agreement.status = 'active';
    agreement.expiresAt = expiryDuration
      ? Date.now() + expiryDuration
      : 0;
    agreement.signatures.forestB = 'signed'; // Would be actual signature

    this.emit('federation:accepted', agreement);
    return true;
  }

  /**
   * Reject a proposed agreement
   */
  async rejectAgreement(agreementId: string, reason: string): Promise<void> {
    const agreement = this.agreements.get(agreementId);
    if (agreement && agreement.status === 'proposed') {
      this.agreements.delete(agreementId);
      this.emit('federation:rejected', agreementId, reason);
    }
  }

  /**
   * Terminate an active agreement
   */
  async terminateAgreement(agreementId: string): Promise<boolean> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement || agreement.status !== 'active') {
      return false;
    }

    agreement.status = 'terminated';
    this.emit('federation:terminated', agreementId);
    return true;
  }

  /**
   * Suspend an agreement temporarily
   */
  async suspendAgreement(agreementId: string): Promise<boolean> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement || agreement.status !== 'active') {
      return false;
    }

    agreement.status = 'suspended';
    return true;
  }

  /**
   * Resume a suspended agreement
   */
  async resumeAgreement(agreementId: string): Promise<boolean> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement || agreement.status !== 'suspended') {
      return false;
    }

    agreement.status = 'active';
    return true;
  }

  /**
   * Get all active agreements
   */
  getActiveAgreements(): FederationAgreement[] {
    return Array.from(this.agreements.values())
      .filter(a => a.status === 'active');
  }

  /**
   * Get agreements with a specific forest
   */
  getAgreementsWith(forestId: string): FederationAgreement[] {
    return Array.from(this.agreements.values())
      .filter(a =>
        (a.forestA === forestId || a.forestB === forestId) &&
        a.status === 'active'
      );
  }

  /**
   * Check if federated with a forest
   */
  isFederatedWith(forestId: string): boolean {
    return this.getAgreementsWith(forestId).length > 0;
  }

  /**
   * Get agreement by ID
   */
  getAgreement(agreementId: string): FederationAgreement | undefined {
    return this.agreements.get(agreementId);
  }

  /**
   * Check for expiring agreements
   */
  getExpiringAgreements(): FederationAgreement[] {
    const warningThreshold = Date.now() + this.config.expiryWarning;
    return Array.from(this.agreements.values())
      .filter(a =>
        a.status === 'active' &&
        a.expiresAt > 0 &&
        a.expiresAt < warningThreshold
      );
  }

  /**
   * Create default terms
   */
  static createDefaultTerms(): FederationTerms {
    return {
      resourceSharing: {
        shareBandwidth: true,
        shareStorage: true,
        shareCompute: false,
        maxSharePercentage: 20,
        creditExchangeRate: 1.0,
      },
      routingPolicy: {
        allowTransit: true,
        priority: 'normal',
        maxLatency: 500,
        reservedBandwidth: 0,
      },
      trustRequirements: {
        minTrustScore: 0.5,
        requiredAttestations: 3,
        verificationInterval: 86400000, // Daily
      },
      disputeResolution: 'arbitration',
    };
  }

  // Private methods

  private generateAgreementId(): string {
    return `fed_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export { FederationAgreement, FederationType, FederationTerms };
