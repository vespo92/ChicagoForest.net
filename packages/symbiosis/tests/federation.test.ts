/**
 * Federation Manager Tests
 *
 * Tests for the FederationManager class that manages inter-forest agreements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FederationManager } from '../src/federation';
import type { FederationTerms, FederationAgreement } from '../src/types';

describe('FederationManager', () => {
  let manager: FederationManager;

  const createDefaultTerms = (): FederationTerms => ({
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
      verificationInterval: 86400000,
    },
    disputeResolution: 'arbitration',
  });

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new FederationManager({
      localForestId: 'chicago-forest',
      minTrustScore: 0.5,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Agreement Proposal', () => {
    it('should propose a new agreement', async () => {
      const proposedHandler = vi.fn();
      manager.on('federation:proposed', proposedHandler);

      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );

      expect(agreement).toBeDefined();
      expect(agreement.status).toBe('proposed');
      expect(agreement.forestA).toBe('chicago-forest');
      expect(agreement.forestB).toBe('remote-forest');
      expect(proposedHandler).toHaveBeenCalledWith(agreement);
    });

    it('should generate unique agreement IDs', async () => {
      const agreement1 = await manager.proposeAgreement(
        'forest-1',
        'mutual',
        createDefaultTerms()
      );
      const agreement2 = await manager.proposeAgreement(
        'forest-2',
        'mutual',
        createDefaultTerms()
      );

      expect(agreement1.id).not.toBe(agreement2.id);
    });

    it('should support different federation types', async () => {
      const mutual = await manager.proposeAgreement('f1', 'mutual', createDefaultTerms());
      const oneWay = await manager.proposeAgreement('f2', 'one-way', createDefaultTerms());
      const limited = await manager.proposeAgreement('f3', 'limited', createDefaultTerms());
      const emergency = await manager.proposeAgreement('f4', 'emergency', createDefaultTerms());

      expect(mutual.type).toBe('mutual');
      expect(oneWay.type).toBe('one-way');
      expect(limited.type).toBe('limited');
      expect(emergency.type).toBe('emergency');
    });
  });

  describe('Agreement Acceptance', () => {
    it('should accept proposed agreement', async () => {
      const acceptedHandler = vi.fn();
      manager.on('federation:accepted', acceptedHandler);

      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );

      const result = await manager.acceptAgreement(agreement.id);

      expect(result).toBe(true);
      expect(acceptedHandler).toHaveBeenCalled();
      expect(manager.getAgreement(agreement.id)?.status).toBe('active');
    });

    it('should set expiry when accepting with duration', async () => {
      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );

      const expiryDuration = 30 * 24 * 60 * 60 * 1000; // 30 days
      await manager.acceptAgreement(agreement.id, expiryDuration);

      const accepted = manager.getAgreement(agreement.id);
      expect(accepted?.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should fail to accept non-existent agreement', async () => {
      const result = await manager.acceptAgreement('non-existent');
      expect(result).toBe(false);
    });

    it('should fail to accept already active agreement', async () => {
      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );

      await manager.acceptAgreement(agreement.id);
      const result = await manager.acceptAgreement(agreement.id);

      expect(result).toBe(false);
    });
  });

  describe('Agreement Rejection', () => {
    it('should reject proposed agreement', async () => {
      const rejectedHandler = vi.fn();
      manager.on('federation:rejected', rejectedHandler);

      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );

      await manager.rejectAgreement(agreement.id, 'Terms not acceptable');

      expect(rejectedHandler).toHaveBeenCalledWith(agreement.id, 'Terms not acceptable');
      expect(manager.getAgreement(agreement.id)).toBeUndefined();
    });

    it('should not reject non-proposed agreement', async () => {
      const rejectedHandler = vi.fn();
      manager.on('federation:rejected', rejectedHandler);

      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );
      await manager.acceptAgreement(agreement.id);

      await manager.rejectAgreement(agreement.id, 'Too late');

      expect(rejectedHandler).not.toHaveBeenCalled();
    });
  });

  describe('Agreement Termination', () => {
    it('should terminate active agreement', async () => {
      const terminatedHandler = vi.fn();
      manager.on('federation:terminated', terminatedHandler);

      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );
      await manager.acceptAgreement(agreement.id);

      const result = await manager.terminateAgreement(agreement.id);

      expect(result).toBe(true);
      expect(terminatedHandler).toHaveBeenCalledWith(agreement.id);
      expect(manager.getAgreement(agreement.id)?.status).toBe('terminated');
    });

    it('should fail to terminate non-active agreement', async () => {
      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );

      const result = await manager.terminateAgreement(agreement.id);

      expect(result).toBe(false);
    });
  });

  describe('Agreement Suspension', () => {
    it('should suspend active agreement', async () => {
      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );
      await manager.acceptAgreement(agreement.id);

      const result = await manager.suspendAgreement(agreement.id);

      expect(result).toBe(true);
      expect(manager.getAgreement(agreement.id)?.status).toBe('suspended');
    });

    it('should resume suspended agreement', async () => {
      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );
      await manager.acceptAgreement(agreement.id);
      await manager.suspendAgreement(agreement.id);

      const result = await manager.resumeAgreement(agreement.id);

      expect(result).toBe(true);
      expect(manager.getAgreement(agreement.id)?.status).toBe('active');
    });

    it('should fail to suspend non-active agreement', async () => {
      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );

      const result = await manager.suspendAgreement(agreement.id);

      expect(result).toBe(false);
    });

    it('should fail to resume non-suspended agreement', async () => {
      const agreement = await manager.proposeAgreement(
        'remote-forest',
        'mutual',
        createDefaultTerms()
      );
      await manager.acceptAgreement(agreement.id);

      const result = await manager.resumeAgreement(agreement.id);

      expect(result).toBe(false);
    });
  });

  describe('Agreement Queries', () => {
    it('should get all active agreements', async () => {
      const a1 = await manager.proposeAgreement('f1', 'mutual', createDefaultTerms());
      const a2 = await manager.proposeAgreement('f2', 'mutual', createDefaultTerms());
      await manager.proposeAgreement('f3', 'mutual', createDefaultTerms()); // not accepted

      await manager.acceptAgreement(a1.id);
      await manager.acceptAgreement(a2.id);

      const active = manager.getActiveAgreements();

      expect(active.length).toBe(2);
    });

    it('should get agreements with specific forest', async () => {
      const a1 = await manager.proposeAgreement('target-forest', 'mutual', createDefaultTerms());
      const a2 = await manager.proposeAgreement('other-forest', 'mutual', createDefaultTerms());

      await manager.acceptAgreement(a1.id);
      await manager.acceptAgreement(a2.id);

      const agreements = manager.getAgreementsWith('target-forest');

      expect(agreements.length).toBe(1);
      expect(agreements[0].forestB).toBe('target-forest');
    });

    it('should check if federated with forest', async () => {
      const agreement = await manager.proposeAgreement('federated-forest', 'mutual', createDefaultTerms());

      expect(manager.isFederatedWith('federated-forest')).toBe(false);

      await manager.acceptAgreement(agreement.id);

      expect(manager.isFederatedWith('federated-forest')).toBe(true);
    });

    it('should detect expiring agreements', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const agreement = await manager.proposeAgreement('expiring-forest', 'mutual', createDefaultTerms());

      // Accept with 5 days expiry (less than 7 days warning threshold)
      const fiveDays = 5 * 24 * 60 * 60 * 1000;
      await manager.acceptAgreement(agreement.id, fiveDays);

      const expiring = manager.getExpiringAgreements();

      expect(expiring.length).toBe(1);
    });
  });

  describe('Default Terms', () => {
    it('should create default federation terms', () => {
      const terms = FederationManager.createDefaultTerms();

      expect(terms.resourceSharing.shareBandwidth).toBe(true);
      expect(terms.resourceSharing.shareStorage).toBe(true);
      expect(terms.resourceSharing.shareCompute).toBe(false);
      expect(terms.routingPolicy.allowTransit).toBe(true);
      expect(terms.routingPolicy.priority).toBe('normal');
      expect(terms.trustRequirements.minTrustScore).toBe(0.5);
      expect(terms.disputeResolution).toBe('arbitration');
    });
  });
});
