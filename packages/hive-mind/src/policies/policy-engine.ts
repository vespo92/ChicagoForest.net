/**
 * Policy Engine - Governance rule enforcement and compliance
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by smart contract access control, RBAC systems, and compliance frameworks.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

/**
 * Policy types
 */
export enum PolicyType {
  ACCESS_CONTROL = 'access_control',
  RATE_LIMIT = 'rate_limit',
  THRESHOLD = 'threshold',
  APPROVAL = 'approval',
  TEMPORAL = 'temporal',
  GEOGRAPHIC = 'geographic',
  REPUTATION = 'reputation',
  STAKE = 'stake',
  CUSTOM = 'custom'
}

/**
 * Policy enforcement result
 */
export enum EnforcementResult {
  ALLOWED = 'allowed',
  DENIED = 'denied',
  REQUIRES_APPROVAL = 'requires_approval',
  RATE_LIMITED = 'rate_limited',
  PENDING_REVIEW = 'pending_review'
}

/**
 * Policy status
 */
export enum PolicyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TESTING = 'testing',
  DEPRECATED = 'deprecated'
}

/**
 * Governance policy definition
 */
export interface Policy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  status: PolicyStatus;
  priority: number;          // Lower number = higher priority
  scope: PolicyScope;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  exceptions: PolicyException[];
  metadata: PolicyMetadata;
  createdAt: number;
  updatedAt: number;
  createdBy: NodeId;
  version: number;
}

/**
 * Policy scope - what the policy applies to
 */
export interface PolicyScope {
  targets: PolicyTarget[];
  includeRoles?: string[];
  excludeRoles?: string[];
  includeNodes?: NodeId[];
  excludeNodes?: NodeId[];
}

/**
 * Policy target
 */
export interface PolicyTarget {
  type: 'action' | 'resource' | 'module' | 'all';
  value: string;
  pattern?: boolean;  // If true, value is a regex pattern
}

/**
 * Policy condition
 */
export interface PolicyCondition {
  id: string;
  type: 'comparison' | 'membership' | 'temporal' | 'custom';
  field: string;
  operator: ConditionOperator;
  value: unknown;
  combineWith?: 'AND' | 'OR';
}

type ConditionOperator =
  | 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte'
  | 'in' | 'not_in' | 'contains' | 'not_contains'
  | 'matches' | 'between' | 'exists' | 'not_exists';

/**
 * Policy action - what to do when conditions match
 */
export interface PolicyAction {
  type: 'allow' | 'deny' | 'require_approval' | 'rate_limit' | 'log' | 'notify' | 'custom';
  params?: Record<string, unknown>;
  priority?: number;
}

/**
 * Policy exception
 */
export interface PolicyException {
  id: string;
  reason: string;
  conditions: PolicyCondition[];
  expiresAt?: number;
  createdBy: NodeId;
}

/**
 * Policy metadata
 */
export interface PolicyMetadata {
  category: string;
  tags: string[];
  documentation?: string;
  relatedPolicies?: string[];
  complianceFramework?: string;
}

/**
 * Policy evaluation context
 */
export interface EvaluationContext {
  actor: NodeId;
  action: string;
  resource?: string;
  timestamp: number;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Policy evaluation result
 */
export interface EvaluationResult {
  allowed: boolean;
  result: EnforcementResult;
  matchedPolicies: string[];
  deniedBy?: string;
  requiresApproval?: {
    policyId: string;
    approvers: string[];
    reason: string;
  };
  rateLimitInfo?: {
    remaining: number;
    resetAt: number;
  };
  violations: PolicyViolation[];
  evaluatedAt: number;
}

/**
 * Policy violation record
 */
export interface PolicyViolation {
  id: string;
  policyId: string;
  actor: NodeId;
  action: string;
  resource?: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  context: Record<string, unknown>;
  resolved: boolean;
  resolution?: string;
}

/**
 * Rate limit tracking
 */
interface RateLimitBucket {
  key: string;
  count: number;
  windowStart: number;
  windowDuration: number;
  limit: number;
}

/**
 * Policy events
 */
export interface PolicyEvents {
  'policy:created': (policy: Policy) => void;
  'policy:updated': (policy: Policy) => void;
  'policy:activated': (policyId: string) => void;
  'policy:deactivated': (policyId: string) => void;
  'evaluation:allowed': (context: EvaluationContext, result: EvaluationResult) => void;
  'evaluation:denied': (context: EvaluationContext, result: EvaluationResult) => void;
  'violation:detected': (violation: PolicyViolation) => void;
  'rate-limit:exceeded': (actor: NodeId, policyId: string) => void;
}

/**
 * Policy engine configuration
 */
export interface PolicyEngineConfig {
  defaultPolicy: 'allow' | 'deny';
  maxPoliciesPerEvaluation: number;
  enableCaching: boolean;
  cacheTTL: number;
  logAllEvaluations: boolean;
  rateLimitWindowMs: number;
}

const DEFAULT_CONFIG: PolicyEngineConfig = {
  defaultPolicy: 'allow',
  maxPoliciesPerEvaluation: 100,
  enableCaching: true,
  cacheTTL: 60 * 1000, // 1 minute
  logAllEvaluations: false,
  rateLimitWindowMs: 60 * 1000 // 1 minute
};

/**
 * Policy Engine
 *
 * Evaluates and enforces governance policies:
 * - Access control
 * - Rate limiting
 * - Threshold enforcement
 * - Approval requirements
 */
export class PolicyEngine extends EventEmitter<PolicyEvents> {
  private config: PolicyEngineConfig;
  private policies: Map<string, Policy> = new Map();
  private violations: Map<string, PolicyViolation> = new Map();
  private rateLimitBuckets: Map<string, RateLimitBucket> = new Map();
  private evaluationCache: Map<string, { result: EvaluationResult; expiresAt: number }> = new Map();

  constructor(config: Partial<PolicyEngineConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDefaultPolicies();
  }

  /**
   * Create a new policy
   */
  createPolicy(
    name: string,
    description: string,
    type: PolicyType,
    scope: PolicyScope,
    conditions: PolicyCondition[],
    actions: PolicyAction[],
    creator: NodeId,
    metadata?: Partial<PolicyMetadata>
  ): Policy {
    const now = Date.now();
    const policy: Policy = {
      id: this.generateId('policy'),
      name,
      description,
      type,
      status: PolicyStatus.TESTING,
      priority: 50,
      scope,
      conditions,
      actions,
      exceptions: [],
      metadata: {
        category: metadata?.category || 'general',
        tags: metadata?.tags || [],
        documentation: metadata?.documentation,
        relatedPolicies: metadata?.relatedPolicies,
        complianceFramework: metadata?.complianceFramework
      },
      createdAt: now,
      updatedAt: now,
      createdBy: creator,
      version: 1
    };

    this.policies.set(policy.id, policy);
    this.emit('policy:created', policy);
    return policy;
  }

  /**
   * Update a policy
   */
  updatePolicy(policyId: string, updates: Partial<Omit<Policy, 'id' | 'createdAt' | 'createdBy'>>): Policy | null {
    const policy = this.policies.get(policyId);
    if (!policy) return null;

    Object.assign(policy, updates);
    policy.updatedAt = Date.now();
    policy.version++;

    this.clearCacheForPolicy(policyId);
    this.emit('policy:updated', policy);
    return policy;
  }

  /**
   * Activate a policy
   */
  activatePolicy(policyId: string): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) return false;

    policy.status = PolicyStatus.ACTIVE;
    policy.updatedAt = Date.now();
    this.emit('policy:activated', policyId);
    return true;
  }

  /**
   * Deactivate a policy
   */
  deactivatePolicy(policyId: string): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) return false;

    policy.status = PolicyStatus.INACTIVE;
    policy.updatedAt = Date.now();
    this.clearCacheForPolicy(policyId);
    this.emit('policy:deactivated', policyId);
    return true;
  }

  /**
   * Add an exception to a policy
   */
  addException(
    policyId: string,
    reason: string,
    conditions: PolicyCondition[],
    creator: NodeId,
    expiresAt?: number
  ): PolicyException | null {
    const policy = this.policies.get(policyId);
    if (!policy) return null;

    const exception: PolicyException = {
      id: this.generateId('exc'),
      reason,
      conditions,
      expiresAt,
      createdBy: creator
    };

    policy.exceptions.push(exception);
    policy.updatedAt = Date.now();
    this.clearCacheForPolicy(policyId);
    return exception;
  }

  /**
   * Evaluate policies for a given context
   */
  evaluate(context: EvaluationContext): EvaluationResult {
    // Check cache
    const cacheKey = this.getCacheKey(context);
    if (this.config.enableCaching) {
      const cached = this.evaluationCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.result;
      }
    }

    const matchedPolicies: string[] = [];
    const violations: PolicyViolation[] = [];
    let finalResult: EnforcementResult = this.config.defaultPolicy === 'allow'
      ? EnforcementResult.ALLOWED
      : EnforcementResult.DENIED;
    let deniedBy: string | undefined;
    let requiresApproval: EvaluationResult['requiresApproval'];
    let rateLimitInfo: EvaluationResult['rateLimitInfo'];

    // Get applicable policies sorted by priority
    const applicablePolicies = this.getApplicablePolicies(context)
      .slice(0, this.config.maxPoliciesPerEvaluation);

    for (const policy of applicablePolicies) {
      // Check if exception applies
      if (this.checkExceptions(policy, context)) {
        continue;
      }

      // Evaluate conditions
      if (!this.evaluateConditions(policy.conditions, context)) {
        continue;
      }

      matchedPolicies.push(policy.id);

      // Process actions
      for (const action of policy.actions) {
        switch (action.type) {
          case 'deny':
            finalResult = EnforcementResult.DENIED;
            deniedBy = policy.id;
            violations.push(this.createViolation(policy, context, 'Action denied by policy'));
            break;

          case 'allow':
            if (finalResult !== EnforcementResult.DENIED) {
              finalResult = EnforcementResult.ALLOWED;
            }
            break;

          case 'require_approval':
            if (finalResult !== EnforcementResult.DENIED) {
              finalResult = EnforcementResult.REQUIRES_APPROVAL;
              requiresApproval = {
                policyId: policy.id,
                approvers: (action.params?.approvers as string[]) || ['admin'],
                reason: (action.params?.reason as string) || policy.description
              };
            }
            break;

          case 'rate_limit':
            const rateResult = this.checkRateLimit(
              context.actor,
              policy.id,
              action.params?.limit as number || 100,
              action.params?.window as number || this.config.rateLimitWindowMs
            );
            if (!rateResult.allowed) {
              finalResult = EnforcementResult.RATE_LIMITED;
              deniedBy = policy.id;
              rateLimitInfo = {
                remaining: 0,
                resetAt: rateResult.resetAt
              };
              this.emit('rate-limit:exceeded', context.actor, policy.id);
            } else {
              rateLimitInfo = {
                remaining: rateResult.remaining,
                resetAt: rateResult.resetAt
              };
            }
            break;

          case 'log':
            // Logging is handled separately
            break;

          case 'notify':
            // Would trigger notifications
            break;
        }
      }

      // Stop if denied (unless checking all policies)
      if (finalResult === EnforcementResult.DENIED) {
        break;
      }
    }

    const result: EvaluationResult = {
      allowed: finalResult === EnforcementResult.ALLOWED,
      result: finalResult,
      matchedPolicies,
      deniedBy,
      requiresApproval,
      rateLimitInfo,
      violations,
      evaluatedAt: Date.now()
    };

    // Cache result
    if (this.config.enableCaching) {
      this.evaluationCache.set(cacheKey, {
        result,
        expiresAt: Date.now() + this.config.cacheTTL
      });
    }

    // Emit events
    if (result.allowed) {
      if (this.config.logAllEvaluations) {
        this.emit('evaluation:allowed', context, result);
      }
    } else {
      this.emit('evaluation:denied', context, result);
      for (const violation of violations) {
        this.violations.set(violation.id, violation);
        this.emit('violation:detected', violation);
      }
    }

    return result;
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): Policy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Get all policies
   */
  getAllPolicies(status?: PolicyStatus): Policy[] {
    const policies = Array.from(this.policies.values());
    if (status) {
      return policies.filter(p => p.status === status);
    }
    return policies;
  }

  /**
   * Get violations
   */
  getViolations(options?: {
    actor?: NodeId;
    policyId?: string;
    unresolved?: boolean;
    limit?: number;
  }): PolicyViolation[] {
    let violations = Array.from(this.violations.values());

    if (options?.actor) {
      violations = violations.filter(v => v.actor === options.actor);
    }
    if (options?.policyId) {
      violations = violations.filter(v => v.policyId === options.policyId);
    }
    if (options?.unresolved) {
      violations = violations.filter(v => !v.resolved);
    }

    violations.sort((a, b) => b.timestamp - a.timestamp);

    if (options?.limit) {
      violations = violations.slice(0, options.limit);
    }

    return violations;
  }

  /**
   * Resolve a violation
   */
  resolveViolation(violationId: string, resolution: string): boolean {
    const violation = this.violations.get(violationId);
    if (!violation) return false;

    violation.resolved = true;
    violation.resolution = resolution;
    return true;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.evaluationCache.clear();
  }

  // Private methods

  private initializeDefaultPolicies(): void {
    // Proposal creation rate limit
    this.createPolicy(
      'proposal-rate-limit',
      'Limit proposal creation to prevent spam',
      PolicyType.RATE_LIMIT,
      {
        targets: [{ type: 'action', value: 'proposal:create' }]
      },
      [],
      [{ type: 'rate_limit', params: { limit: 5, window: 86400000 } }], // 5 per day
      'system' as NodeId,
      { category: 'anti-spam', tags: ['governance', 'rate-limit'] }
    );

    // Treasury access control
    this.createPolicy(
      'treasury-access',
      'Control access to treasury operations',
      PolicyType.ACCESS_CONTROL,
      {
        targets: [{ type: 'module', value: 'treasury' }]
      },
      [
        {
          id: 'min-stake',
          type: 'comparison',
          field: 'actor.stake',
          operator: 'gte',
          value: 100
        }
      ],
      [
        { type: 'allow' },
        { type: 'log', params: { level: 'info' } }
      ],
      'system' as NodeId,
      { category: 'access-control', tags: ['treasury', 'security'] }
    );

    // Emergency action restrictions
    this.createPolicy(
      'emergency-restrictions',
      'Restrict emergency actions to authorized responders',
      PolicyType.ACCESS_CONTROL,
      {
        targets: [{ type: 'action', value: 'emergency:*', pattern: true }]
      },
      [
        {
          id: 'responder-check',
          type: 'membership',
          field: 'actor.roles',
          operator: 'contains',
          value: 'emergency-responder'
        }
      ],
      [
        { type: 'allow' }
      ],
      'system' as NodeId,
      { category: 'emergency', tags: ['security', 'emergency'] }
    );

    // Activate default policies
    this.activatePolicy('proposal-rate-limit');
    this.activatePolicy('treasury-access');
    this.activatePolicy('emergency-restrictions');
  }

  private getApplicablePolicies(context: EvaluationContext): Policy[] {
    return Array.from(this.policies.values())
      .filter(p => p.status === PolicyStatus.ACTIVE)
      .filter(p => this.matchesScope(p.scope, context))
      .sort((a, b) => a.priority - b.priority);
  }

  private matchesScope(scope: PolicyScope, context: EvaluationContext): boolean {
    // Check exclusions first
    if (scope.excludeNodes?.includes(context.actor)) {
      return false;
    }

    // Check targets
    for (const target of scope.targets) {
      if (target.type === 'all') {
        return true;
      }

      let matches = false;
      const valueToCheck = target.type === 'action' ? context.action : context.resource || '';

      if (target.pattern) {
        const regex = new RegExp(target.value.replace(/\*/g, '.*'));
        matches = regex.test(valueToCheck);
      } else {
        matches = valueToCheck === target.value;
      }

      if (matches) return true;
    }

    return false;
  }

  private evaluateConditions(conditions: PolicyCondition[], context: EvaluationContext): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let combineWithOr = false;

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, context);

      if (combineWithOr) {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }

      combineWithOr = condition.combineWith === 'OR';
    }

    return result;
  }

  private evaluateCondition(condition: PolicyCondition, context: EvaluationContext): boolean {
    const value = this.getFieldValue(condition.field, context);

    switch (condition.operator) {
      case 'eq': return value === condition.value;
      case 'neq': return value !== condition.value;
      case 'lt': return (value as number) < (condition.value as number);
      case 'lte': return (value as number) <= (condition.value as number);
      case 'gt': return (value as number) > (condition.value as number);
      case 'gte': return (value as number) >= (condition.value as number);
      case 'in': return (condition.value as unknown[]).includes(value);
      case 'not_in': return !(condition.value as unknown[]).includes(value);
      case 'contains': return (value as unknown[])?.includes(condition.value);
      case 'not_contains': return !(value as unknown[])?.includes(condition.value);
      case 'matches': return new RegExp(condition.value as string).test(value as string);
      case 'exists': return value !== undefined && value !== null;
      case 'not_exists': return value === undefined || value === null;
      case 'between':
        const [min, max] = condition.value as [number, number];
        return (value as number) >= min && (value as number) <= max;
      default:
        return false;
    }
  }

  private getFieldValue(field: string, context: EvaluationContext): unknown {
    const parts = field.split('.');
    let value: unknown = context;

    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      value = (value as Record<string, unknown>)[part];
    }

    return value;
  }

  private checkExceptions(policy: Policy, context: EvaluationContext): boolean {
    const now = Date.now();

    for (const exception of policy.exceptions) {
      // Check if expired
      if (exception.expiresAt && exception.expiresAt < now) {
        continue;
      }

      // Check if conditions match
      if (this.evaluateConditions(exception.conditions, context)) {
        return true;
      }
    }

    return false;
  }

  private checkRateLimit(
    actor: NodeId,
    policyId: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const key = `${actor}:${policyId}`;
    const now = Date.now();
    let bucket = this.rateLimitBuckets.get(key);

    if (!bucket || now >= bucket.windowStart + bucket.windowDuration) {
      bucket = {
        key,
        count: 0,
        windowStart: now,
        windowDuration: windowMs,
        limit
      };
      this.rateLimitBuckets.set(key, bucket);
    }

    bucket.count++;
    const allowed = bucket.count <= limit;
    const remaining = Math.max(0, limit - bucket.count);
    const resetAt = bucket.windowStart + bucket.windowDuration;

    return { allowed, remaining, resetAt };
  }

  private createViolation(policy: Policy, context: EvaluationContext, reason: string): PolicyViolation {
    return {
      id: this.generateId('violation'),
      policyId: policy.id,
      actor: context.actor,
      action: context.action,
      resource: context.resource,
      reason,
      severity: this.determineSeverity(policy),
      timestamp: Date.now(),
      context: { ...context.params, ...context.metadata },
      resolved: false
    };
  }

  private determineSeverity(policy: Policy): PolicyViolation['severity'] {
    switch (policy.type) {
      case PolicyType.ACCESS_CONTROL: return 'high';
      case PolicyType.RATE_LIMIT: return 'low';
      case PolicyType.THRESHOLD: return 'medium';
      default: return 'medium';
    }
  }

  private getCacheKey(context: EvaluationContext): string {
    return `${context.actor}:${context.action}:${context.resource || ''}`;
  }

  private clearCacheForPolicy(policyId: string): void {
    // Simple implementation: clear all cache
    // More sophisticated: only clear entries that matched this policy
    this.evaluationCache.clear();
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default PolicyEngine;
