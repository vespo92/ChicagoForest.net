/**
 * Emergency Governance - Crisis management and rapid response
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by emergency governance mechanisms in traditional organizations
 * and blockchain circuit breakers.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

/**
 * Emergency severity levels
 */
export enum EmergencySeverity {
  ALERT = 'alert',           // Warning, no action yet
  WARNING = 'warning',       // Elevated concern
  CRITICAL = 'critical',     // Immediate action required
  CATASTROPHIC = 'catastrophic' // Network-threatening
}

/**
 * Emergency types
 */
export enum EmergencyType {
  SECURITY_BREACH = 'security_breach',
  ECONOMIC_ATTACK = 'economic_attack',
  NETWORK_FAILURE = 'network_failure',
  GOVERNANCE_ATTACK = 'governance_attack',
  EXTERNAL_THREAT = 'external_threat',
  PROTOCOL_BUG = 'protocol_bug',
  NATURAL_DISASTER = 'natural_disaster'
}

/**
 * Emergency status
 */
export enum EmergencyStatus {
  DECLARED = 'declared',
  ACTIVE = 'active',
  CONTAINED = 'contained',
  RESOLVING = 'resolving',
  RESOLVED = 'resolved',
  POST_MORTEM = 'post_mortem',
  ARCHIVED = 'archived'
}

/**
 * Emergency action types
 */
export enum EmergencyAction {
  PAUSE_GOVERNANCE = 'pause_governance',
  PAUSE_TREASURY = 'pause_treasury',
  PAUSE_STAKING = 'pause_staking',
  ISOLATE_NODE = 'isolate_node',
  FREEZE_ASSETS = 'freeze_assets',
  ROLLBACK = 'rollback',
  UPGRADE_PROTOCOL = 'upgrade_protocol',
  BROADCAST_ALERT = 'broadcast_alert',
  ACTIVATE_BACKUP = 'activate_backup',
  SHUTDOWN = 'shutdown'
}

/**
 * Emergency declaration
 */
export interface EmergencyDeclaration {
  id: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  declaredBy: NodeId;
  secondedBy: NodeId[];
  title: string;
  description: string;
  evidence: string[];
  affectedSystems: string[];
  actions: EmergencyActionRecord[];
  timeline: EmergencyTimelineEntry[];
  ratificationDeadline: number;
  ratified: boolean;
  ratificationVotes: Map<NodeId, boolean>;
  declaredAt: number;
  containedAt?: number;
  resolvedAt?: number;
  postMortem?: PostMortem;
}

/**
 * Emergency action record
 */
export interface EmergencyActionRecord {
  id: string;
  action: EmergencyAction;
  target?: string;
  params?: Record<string, unknown>;
  executedBy: NodeId;
  executedAt: number;
  success: boolean;
  result?: string;
  reversible: boolean;
  reversed: boolean;
}

/**
 * Timeline entry for tracking emergency response
 */
export interface EmergencyTimelineEntry {
  timestamp: number;
  actor: NodeId;
  action: string;
  details: string;
}

/**
 * Post-mortem report
 */
export interface PostMortem {
  id: string;
  emergencyId: string;
  preparedBy: NodeId[];
  summary: string;
  timeline: string;
  rootCause: string;
  impact: {
    nodesAffected: number;
    durationMinutes: number;
    economicImpact?: number;
  };
  actionsReview: {
    effective: string[];
    ineffective: string[];
    missed: string[];
  };
  recommendations: string[];
  preventiveMeasures: string[];
  approved: boolean;
  approvers: NodeId[];
  createdAt: number;
}

/**
 * Emergency responder role
 */
export interface EmergencyResponder {
  nodeId: NodeId;
  role: 'coordinator' | 'responder' | 'observer';
  specializations: EmergencyType[];
  availability: boolean;
  responseHistory: {
    emergencyId: string;
    role: string;
    rating?: number;
  }[];
}

/**
 * Emergency events
 */
export interface EmergencyEvents {
  'emergency:declared': (emergency: EmergencyDeclaration) => void;
  'emergency:seconded': (emergencyId: string, secondedBy: NodeId) => void;
  'emergency:action-executed': (emergencyId: string, action: EmergencyActionRecord) => void;
  'emergency:status-changed': (emergencyId: string, status: EmergencyStatus) => void;
  'emergency:ratified': (emergencyId: string) => void;
  'emergency:rejected': (emergencyId: string) => void;
  'emergency:resolved': (emergencyId: string) => void;
  'alert:broadcast': (message: string, severity: EmergencySeverity) => void;
}

/**
 * Emergency governance configuration
 */
export interface EmergencyConfig {
  minSecondersToActivate: number;
  ratificationPeriod: number;
  ratificationQuorum: number;
  ratificationThreshold: number;
  maxEmergencyDuration: number;
  cooldownPeriod: number;
  autoEscalateSeverity: boolean;
  requirePostMortem: boolean;
  maxConcurrentEmergencies: number;
  allowedActionsPerSeverity: Map<EmergencySeverity, EmergencyAction[]>;
}

const DEFAULT_CONFIG: EmergencyConfig = {
  minSecondersToActivate: 2,
  ratificationPeriod: 72 * 60 * 60 * 1000, // 72 hours
  ratificationQuorum: 0.3,
  ratificationThreshold: 0.5,
  maxEmergencyDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
  cooldownPeriod: 24 * 60 * 60 * 1000, // 24 hours
  autoEscalateSeverity: true,
  requirePostMortem: true,
  maxConcurrentEmergencies: 3,
  allowedActionsPerSeverity: new Map([
    [EmergencySeverity.ALERT, [EmergencyAction.BROADCAST_ALERT]],
    [EmergencySeverity.WARNING, [
      EmergencyAction.BROADCAST_ALERT,
      EmergencyAction.PAUSE_STAKING
    ]],
    [EmergencySeverity.CRITICAL, [
      EmergencyAction.BROADCAST_ALERT,
      EmergencyAction.PAUSE_STAKING,
      EmergencyAction.PAUSE_TREASURY,
      EmergencyAction.ISOLATE_NODE,
      EmergencyAction.FREEZE_ASSETS
    ]],
    [EmergencySeverity.CATASTROPHIC, [
      EmergencyAction.BROADCAST_ALERT,
      EmergencyAction.PAUSE_STAKING,
      EmergencyAction.PAUSE_TREASURY,
      EmergencyAction.PAUSE_GOVERNANCE,
      EmergencyAction.ISOLATE_NODE,
      EmergencyAction.FREEZE_ASSETS,
      EmergencyAction.ROLLBACK,
      EmergencyAction.UPGRADE_PROTOCOL,
      EmergencyAction.ACTIVATE_BACKUP,
      EmergencyAction.SHUTDOWN
    ]]
  ])
};

/**
 * Emergency Governance System
 *
 * Handles crisis situations with:
 * - Rapid response mechanisms
 * - Escalation procedures
 * - Ratification requirements
 * - Post-mortem analysis
 */
export class EmergencyGovernance extends EventEmitter<EmergencyEvents> {
  private config: EmergencyConfig;
  private emergencies: Map<string, EmergencyDeclaration> = new Map();
  private responders: Map<NodeId, EmergencyResponder> = new Map();
  private postMortems: Map<string, PostMortem> = new Map();
  private cooldowns: Map<NodeId, number> = new Map();

  constructor(config: Partial<EmergencyConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Declare an emergency
   */
  declareEmergency(
    declarer: NodeId,
    type: EmergencyType,
    severity: EmergencySeverity,
    title: string,
    description: string,
    evidence: string[] = []
  ): EmergencyDeclaration | null {
    // Check cooldown
    const cooldown = this.cooldowns.get(declarer);
    if (cooldown && Date.now() < cooldown) {
      return null;
    }

    // Check concurrent emergencies
    const activeEmergencies = Array.from(this.emergencies.values())
      .filter(e => e.status === EmergencyStatus.ACTIVE || e.status === EmergencyStatus.DECLARED);
    if (activeEmergencies.length >= this.config.maxConcurrentEmergencies) {
      return null;
    }

    const now = Date.now();
    const emergency: EmergencyDeclaration = {
      id: this.generateId('emerg'),
      type,
      severity,
      status: EmergencyStatus.DECLARED,
      declaredBy: declarer,
      secondedBy: [],
      title,
      description,
      evidence,
      affectedSystems: [],
      actions: [],
      timeline: [{
        timestamp: now,
        actor: declarer,
        action: 'Emergency declared',
        details: `${type} - ${severity}: ${title}`
      }],
      ratificationDeadline: now + this.config.ratificationPeriod,
      ratified: false,
      ratificationVotes: new Map(),
      declaredAt: now
    };

    this.emergencies.set(emergency.id, emergency);
    this.emit('emergency:declared', emergency);

    // Broadcast alert
    this.emit('alert:broadcast', `EMERGENCY: ${title}`, severity);

    return emergency;
  }

  /**
   * Second an emergency declaration
   */
  secondEmergency(emergencyId: string, seconder: NodeId): boolean {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency || emergency.status !== EmergencyStatus.DECLARED) {
      return false;
    }

    if (emergency.declaredBy === seconder || emergency.secondedBy.includes(seconder)) {
      return false;
    }

    emergency.secondedBy.push(seconder);
    emergency.timeline.push({
      timestamp: Date.now(),
      actor: seconder,
      action: 'Emergency seconded',
      details: `Seconder ${emergency.secondedBy.length} of ${this.config.minSecondersToActivate} required`
    });

    this.emit('emergency:seconded', emergencyId, seconder);

    // Check if we have enough seconders
    if (emergency.secondedBy.length >= this.config.minSecondersToActivate) {
      this.activateEmergency(emergencyId);
    }

    return true;
  }

  /**
   * Activate an emergency (after sufficient seconding)
   */
  private activateEmergency(emergencyId: string): void {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency) return;

    emergency.status = EmergencyStatus.ACTIVE;
    emergency.timeline.push({
      timestamp: Date.now(),
      actor: emergency.declaredBy,
      action: 'Emergency activated',
      details: `Emergency now active with ${emergency.secondedBy.length + 1} confirmations`
    });

    this.emit('emergency:status-changed', emergencyId, EmergencyStatus.ACTIVE);
  }

  /**
   * Execute an emergency action
   */
  executeEmergencyAction(
    emergencyId: string,
    executor: NodeId,
    action: EmergencyAction,
    target?: string,
    params?: Record<string, unknown>
  ): EmergencyActionRecord | null {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency || emergency.status !== EmergencyStatus.ACTIVE) {
      return null;
    }

    // Check if action is allowed for this severity
    const allowedActions = this.config.allowedActionsPerSeverity.get(emergency.severity);
    if (!allowedActions || !allowedActions.includes(action)) {
      return null;
    }

    // Check if executor is authorized
    if (!this.isAuthorizedResponder(executor, emergency.type)) {
      return null;
    }

    const now = Date.now();
    const actionRecord: EmergencyActionRecord = {
      id: this.generateId('action'),
      action,
      target,
      params,
      executedBy: executor,
      executedAt: now,
      success: true, // Would be determined by actual execution
      reversible: this.isReversibleAction(action),
      reversed: false
    };

    emergency.actions.push(actionRecord);
    emergency.timeline.push({
      timestamp: now,
      actor: executor,
      action: `Executed: ${action}`,
      details: target ? `Target: ${target}` : 'Network-wide action'
    });

    this.emit('emergency:action-executed', emergencyId, actionRecord);
    return actionRecord;
  }

  /**
   * Reverse an emergency action
   */
  reverseAction(emergencyId: string, actionId: string, executor: NodeId): boolean {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency) return false;

    const action = emergency.actions.find(a => a.id === actionId);
    if (!action || !action.reversible || action.reversed) {
      return false;
    }

    action.reversed = true;
    emergency.timeline.push({
      timestamp: Date.now(),
      actor: executor,
      action: `Reversed: ${action.action}`,
      details: `Action ${actionId} has been reversed`
    });

    return true;
  }

  /**
   * Mark emergency as contained
   */
  markContained(emergencyId: string, containedBy: NodeId): boolean {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency || emergency.status !== EmergencyStatus.ACTIVE) {
      return false;
    }

    emergency.status = EmergencyStatus.CONTAINED;
    emergency.containedAt = Date.now();
    emergency.timeline.push({
      timestamp: Date.now(),
      actor: containedBy,
      action: 'Emergency contained',
      details: 'Immediate threat neutralized, beginning resolution phase'
    });

    this.emit('emergency:status-changed', emergencyId, EmergencyStatus.CONTAINED);
    return true;
  }

  /**
   * Resolve an emergency
   */
  resolveEmergency(emergencyId: string, resolver: NodeId): boolean {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency) return false;

    if (emergency.status !== EmergencyStatus.CONTAINED && emergency.status !== EmergencyStatus.RESOLVING) {
      return false;
    }

    emergency.status = EmergencyStatus.RESOLVED;
    emergency.resolvedAt = Date.now();
    emergency.timeline.push({
      timestamp: Date.now(),
      actor: resolver,
      action: 'Emergency resolved',
      details: 'Normal operations can resume'
    });

    // Set cooldown for declarer
    this.cooldowns.set(emergency.declaredBy, Date.now() + this.config.cooldownPeriod);

    this.emit('emergency:resolved', emergencyId);
    this.emit('emergency:status-changed', emergencyId, EmergencyStatus.RESOLVED);

    return true;
  }

  /**
   * Vote on emergency ratification
   */
  voteRatification(emergencyId: string, voter: NodeId, approve: boolean): boolean {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency) return false;

    if (Date.now() > emergency.ratificationDeadline) {
      return false;
    }

    emergency.ratificationVotes.set(voter, approve);
    return true;
  }

  /**
   * Finalize ratification
   */
  finalizeRatification(emergencyId: string, totalEligible: number): boolean {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency || emergency.ratified) return false;

    const approvals = Array.from(emergency.ratificationVotes.values()).filter(v => v).length;
    const total = emergency.ratificationVotes.size;
    const participation = total / totalEligible;
    const approvalRate = total > 0 ? approvals / total : 0;

    if (participation >= this.config.ratificationQuorum &&
        approvalRate >= this.config.ratificationThreshold) {
      emergency.ratified = true;
      this.emit('emergency:ratified', emergencyId);
      return true;
    } else {
      this.emit('emergency:rejected', emergencyId);
      return false;
    }
  }

  /**
   * Submit post-mortem
   */
  submitPostMortem(
    emergencyId: string,
    preparedBy: NodeId[],
    summary: string,
    timeline: string,
    rootCause: string,
    impact: PostMortem['impact'],
    actionsReview: PostMortem['actionsReview'],
    recommendations: string[],
    preventiveMeasures: string[]
  ): PostMortem | null {
    const emergency = this.emergencies.get(emergencyId);
    if (!emergency || emergency.status !== EmergencyStatus.RESOLVED) {
      return null;
    }

    const postMortem: PostMortem = {
      id: this.generateId('pm'),
      emergencyId,
      preparedBy,
      summary,
      timeline,
      rootCause,
      impact,
      actionsReview,
      recommendations,
      preventiveMeasures,
      approved: false,
      approvers: [],
      createdAt: Date.now()
    };

    this.postMortems.set(postMortem.id, postMortem);
    emergency.postMortem = postMortem;
    emergency.status = EmergencyStatus.POST_MORTEM;

    return postMortem;
  }

  /**
   * Approve post-mortem
   */
  approvePostMortem(postMortemId: string, approver: NodeId): boolean {
    const postMortem = this.postMortems.get(postMortemId);
    if (!postMortem || postMortem.approved) return false;

    if (!postMortem.approvers.includes(approver)) {
      postMortem.approvers.push(approver);
    }

    // Could have threshold for approval
    if (postMortem.approvers.length >= 3) {
      postMortem.approved = true;
      const emergency = this.emergencies.get(postMortem.emergencyId);
      if (emergency) {
        emergency.status = EmergencyStatus.ARCHIVED;
      }
    }

    return true;
  }

  /**
   * Register an emergency responder
   */
  registerResponder(
    nodeId: NodeId,
    role: EmergencyResponder['role'],
    specializations: EmergencyType[]
  ): EmergencyResponder {
    const responder: EmergencyResponder = {
      nodeId,
      role,
      specializations,
      availability: true,
      responseHistory: []
    };

    this.responders.set(nodeId, responder);
    return responder;
  }

  /**
   * Get emergency by ID
   */
  getEmergency(emergencyId: string): EmergencyDeclaration | undefined {
    return this.emergencies.get(emergencyId);
  }

  /**
   * Get active emergencies
   */
  getActiveEmergencies(): EmergencyDeclaration[] {
    return Array.from(this.emergencies.values())
      .filter(e => e.status === EmergencyStatus.ACTIVE || e.status === EmergencyStatus.DECLARED);
  }

  /**
   * Get emergency statistics
   */
  getStatistics() {
    const all = Array.from(this.emergencies.values());
    return {
      total: all.length,
      active: all.filter(e => e.status === EmergencyStatus.ACTIVE).length,
      resolved: all.filter(e => e.status === EmergencyStatus.RESOLVED || e.status === EmergencyStatus.ARCHIVED).length,
      ratified: all.filter(e => e.ratified).length,
      averageResolutionTime: this.calculateAverageResolutionTime(all),
      bySeverity: {
        alert: all.filter(e => e.severity === EmergencySeverity.ALERT).length,
        warning: all.filter(e => e.severity === EmergencySeverity.WARNING).length,
        critical: all.filter(e => e.severity === EmergencySeverity.CRITICAL).length,
        catastrophic: all.filter(e => e.severity === EmergencySeverity.CATASTROPHIC).length
      }
    };
  }

  // Private methods

  private isAuthorizedResponder(nodeId: NodeId, emergencyType: EmergencyType): boolean {
    const responder = this.responders.get(nodeId);
    if (!responder) return false;
    if (!responder.availability) return false;
    if (responder.role === 'observer') return false;
    return responder.specializations.includes(emergencyType) || responder.role === 'coordinator';
  }

  private isReversibleAction(action: EmergencyAction): boolean {
    const reversible = [
      EmergencyAction.PAUSE_GOVERNANCE,
      EmergencyAction.PAUSE_TREASURY,
      EmergencyAction.PAUSE_STAKING,
      EmergencyAction.ISOLATE_NODE,
      EmergencyAction.FREEZE_ASSETS
    ];
    return reversible.includes(action);
  }

  private calculateAverageResolutionTime(emergencies: EmergencyDeclaration[]): number {
    const resolved = emergencies.filter(e => e.resolvedAt);
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, e) => sum + (e.resolvedAt! - e.declaredAt), 0);
    return totalTime / resolved.length;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default EmergencyGovernance;
