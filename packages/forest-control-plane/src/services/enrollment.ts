/**
 * @chicago-forest/forest-control-plane - Enrollment Service
 *
 * Handles enrollment token generation and config bundle creation
 * for new routers joining the Forest mesh.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { nanoid } from 'nanoid';
import type { ForestStore } from '../store/sqlite';
import type { ForestCPConfig } from '../config';
import type { WireGuardKeyService } from './wireguard-keys';
import type { BootstrapManager } from './bootstrap-manager';
import type {
  CreateEnrollmentRequest,
  EnrollmentRecord,
  EnrollmentConfigBundle,
  EnrollmentStatus,
  MeshNodeConfig,
} from '../types';
import type { FrequencyBand, MeshRoutingProtocol } from '@chicago-forest/shared-types';
import { createDefaultForestRules } from '@chicago-forest/firewall';

export class EnrollmentService {
  constructor(
    private store: ForestStore,
    private config: ForestCPConfig,
    private wgKeys: WireGuardKeyService,
    private bootstrapManager: BootstrapManager,
  ) {}

  /** Create a new enrollment token */
  async createEnrollment(req: CreateEnrollmentRequest): Promise<EnrollmentRecord> {
    const user = req.headscaleUser ?? this.config.headscaleUser;
    const validityHours = req.validityHours ?? this.config.enrollmentValidityHours;

    // Ensure the Headscale user exists
    await this.wgKeys.ensureUser(user);

    // Create a pre-auth key in Headscale
    const preauthKey = await this.wgKeys.createPreauthKey(user, validityHours);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityHours * 60 * 60 * 1000);

    const record: EnrollmentRecord = {
      token: nanoid(32),
      nodeName: req.nodeName,
      capabilities: req.capabilities ?? [],
      headscaleAuthKey: preauthKey.key,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.store.insertEnrollment(record);
    return record;
  }

  /** Retrieve the full config bundle for a given enrollment token */
  getConfigBundle(token: string): EnrollmentConfigBundle | undefined {
    // Expire stale enrollments first
    this.store.expireEnrollments();

    const record = this.store.getEnrollment(token);
    if (!record || record.status !== 'pending') {
      return undefined;
    }

    const bootstrapPeers = this.bootstrapManager.getBootstrapPeerAddresses();

    const meshConfig: MeshNodeConfig = {
      protocol: this.config.mesh.protocol as MeshRoutingProtocol,
      interface: this.config.mesh.interface,
      channel: this.config.mesh.channel,
      essid: this.config.mesh.essid,
      band: this.config.mesh.band as FrequencyBand,
      mtu: this.config.mesh.mtu,
      hopPenalty: 15,
      origInterval: 1000,
    };

    const firewallRules = createDefaultForestRules();

    return {
      token: record.token,
      headscaleUrl: this.config.headscaleUrl,
      headscaleAuthKey: record.headscaleAuthKey,
      bootstrapPeers,
      meshConfig,
      firewallRules,
      controlPlaneUrl: this.config.publicUrl,
      nodeName: record.nodeName,
      capabilities: record.capabilities,
    };
  }

  /** Mark an enrollment token as claimed by a node */
  claimEnrollment(token: string, nodeId: string): boolean {
    return this.store.claimEnrollment(token, nodeId);
  }

  /** Revoke an enrollment token */
  revokeEnrollment(token: string): boolean {
    return this.store.revokeEnrollment(token);
  }

  /** List enrollments, optionally filtered by status */
  listEnrollments(status?: EnrollmentStatus): EnrollmentRecord[] {
    return this.store.listEnrollments(status);
  }
}
