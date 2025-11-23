/**
 * @chicago-forest/canopy-api - Rate Limiting Middleware
 *
 * Implements rate limiting to protect the API from abuse and ensure
 * fair resource distribution across the Chicago Forest Network.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Rate limiting follows standard patterns but would
 * need additional hardening for production use.
 *
 * Features:
 * - Token bucket algorithm
 * - Per-client rate limits
 * - Tiered limits based on authentication
 * - Burst allowance
 * - Distributed rate limiting support (theoretical)
 */

import type { ApiRequest, ApiResponse, RateLimitMeta } from '../../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Rate limit tier
 */
export type RateLimitTier = 'anonymous' | 'authenticated' | 'node' | 'premium' | 'unlimited';

/**
 * Rate limit configuration per tier
 */
export interface TierLimits {
  /** Requests per minute */
  requestsPerMinute: number;
  /** Burst capacity (tokens) */
  burstCapacity: number;
  /** Token refill rate per second */
  refillRate: number;
  /** Maximum concurrent requests */
  maxConcurrent: number;
}

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  /** Enable rate limiting */
  enabled: boolean;
  /** Limits per tier */
  tiers: Record<RateLimitTier, TierLimits>;
  /** Header to identify client (fallback to IP) */
  clientIdHeader: string;
  /** Include rate limit headers in response */
  includeHeaders: boolean;
  /** Cleanup interval for stale buckets (ms) */
  cleanupInterval: number;
  /** Bucket TTL (ms) */
  bucketTtl: number;
}

/**
 * Token bucket state
 */
interface TokenBucket {
  /** Available tokens */
  tokens: number;
  /** Last refill timestamp */
  lastRefill: number;
  /** Current concurrent requests */
  concurrent: number;
  /** Client tier */
  tier: RateLimitTier;
  /** Created timestamp */
  createdAt: number;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Is request allowed */
  allowed: boolean;
  /** Remaining requests */
  remaining: number;
  /** Reset timestamp */
  resetAt: number;
  /** Retry after (seconds) if blocked */
  retryAfter?: number;
  /** Rate limit tier applied */
  tier: RateLimitTier;
}

/**
 * Middleware function type
 */
export type Middleware = (
  request: ApiRequest,
  next: () => Promise<ApiResponse>
) => Promise<ApiResponse>;

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_TIER_LIMITS: Record<RateLimitTier, TierLimits> = {
  anonymous: {
    requestsPerMinute: 60,
    burstCapacity: 10,
    refillRate: 1,
    maxConcurrent: 5,
  },
  authenticated: {
    requestsPerMinute: 300,
    burstCapacity: 30,
    refillRate: 5,
    maxConcurrent: 20,
  },
  node: {
    requestsPerMinute: 600,
    burstCapacity: 60,
    refillRate: 10,
    maxConcurrent: 50,
  },
  premium: {
    requestsPerMinute: 3000,
    burstCapacity: 100,
    refillRate: 50,
    maxConcurrent: 100,
  },
  unlimited: {
    requestsPerMinute: Infinity,
    burstCapacity: Infinity,
    refillRate: Infinity,
    maxConcurrent: Infinity,
  },
};

// =============================================================================
// Rate Limiter Class
// =============================================================================

/**
 * Token bucket rate limiter
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private buckets: Map<string, TokenBucket> = new Map();
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      enabled: true,
      tiers: { ...DEFAULT_TIER_LIMITS, ...config.tiers },
      clientIdHeader: config.clientIdHeader || 'x-client-id',
      includeHeaders: config.includeHeaders ?? true,
      cleanupInterval: config.cleanupInterval || 60000, // 1 minute
      bucketTtl: config.bucketTtl || 600000, // 10 minutes
    };

    // Start cleanup timer
    this.startCleanup();
  }

  /**
   * Check if request should be allowed
   */
  checkLimit(clientId: string, tier: RateLimitTier = 'anonymous'): RateLimitResult {
    if (!this.config.enabled) {
      return {
        allowed: true,
        remaining: Infinity,
        resetAt: 0,
        tier: 'unlimited',
      };
    }

    const limits = this.config.tiers[tier];
    const bucket = this.getOrCreateBucket(clientId, tier);

    // Refill tokens based on elapsed time
    this.refillBucket(bucket, limits);

    // Check if request can be made
    if (bucket.tokens < 1) {
      const retryAfter = Math.ceil((1 - bucket.tokens) / limits.refillRate);
      return {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + retryAfter * 1000,
        retryAfter,
        tier,
      };
    }

    // Check concurrent limit
    if (bucket.concurrent >= limits.maxConcurrent) {
      return {
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        resetAt: Date.now() + 1000,
        retryAfter: 1,
        tier,
      };
    }

    // Consume token
    bucket.tokens -= 1;
    bucket.concurrent += 1;

    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetAt: Date.now() + 60000, // 1 minute from now
      tier,
    };
  }

  /**
   * Release concurrent slot after request completes
   */
  releaseSlot(clientId: string): void {
    const bucket = this.buckets.get(clientId);
    if (bucket && bucket.concurrent > 0) {
      bucket.concurrent -= 1;
    }
  }

  /**
   * Get current status for a client
   */
  getStatus(clientId: string): RateLimitResult | null {
    const bucket = this.buckets.get(clientId);
    if (!bucket) return null;

    const limits = this.config.tiers[bucket.tier];
    this.refillBucket(bucket, limits);

    return {
      allowed: bucket.tokens >= 1,
      remaining: Math.floor(bucket.tokens),
      resetAt: Date.now() + Math.ceil((limits.burstCapacity - bucket.tokens) / limits.refillRate) * 1000,
      tier: bucket.tier,
    };
  }

  /**
   * Reset rate limit for a client
   */
  reset(clientId: string): void {
    this.buckets.delete(clientId);
  }

  /**
   * Get all active buckets (for monitoring)
   */
  getActiveBuckets(): Map<string, TokenBucket> {
    return new Map(this.buckets);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Stop the rate limiter (cleanup timer)
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  // Private methods

  private getOrCreateBucket(clientId: string, tier: RateLimitTier): TokenBucket {
    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      const limits = this.config.tiers[tier];
      bucket = {
        tokens: limits.burstCapacity,
        lastRefill: Date.now(),
        concurrent: 0,
        tier,
        createdAt: Date.now(),
      };
      this.buckets.set(clientId, bucket);
    }

    return bucket;
  }

  private refillBucket(bucket: TokenBucket, limits: TierLimits): void {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    const refill = elapsed * limits.refillRate;

    bucket.tokens = Math.min(limits.burstCapacity, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const ttl = this.config.bucketTtl;

      for (const [clientId, bucket] of this.buckets) {
        // Remove stale buckets
        if (now - bucket.lastRefill > ttl && bucket.concurrent === 0) {
          this.buckets.delete(clientId);
        }
      }
    }, this.config.cleanupInterval);
  }
}

// =============================================================================
// Middleware Factory
// =============================================================================

/**
 * Create rate limiting middleware
 */
export function createRateLimitMiddleware(
  limiter: RateLimiter,
  options: {
    getTier?: (request: ApiRequest) => RateLimitTier;
    getClientId?: (request: ApiRequest) => string;
    onRateLimited?: (request: ApiRequest, result: RateLimitResult) => void;
  } = {}
): Middleware {
  const {
    getTier = defaultGetTier,
    getClientId = defaultGetClientId,
    onRateLimited,
  } = options;

  return async (request: ApiRequest, next: () => Promise<ApiResponse>): Promise<ApiResponse> => {
    const clientId = getClientId(request);
    const tier = getTier(request);

    const result = limiter.checkLimit(clientId, tier);

    if (!result.allowed) {
      if (onRateLimited) {
        onRateLimited(request, result);
      }

      return {
        id: request.id,
        status: 429,
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Rate limit exceeded. Retry after ${result.retryAfter} seconds.`,
          details: {
            tier: result.tier,
            retryAfter: result.retryAfter,
            resetAt: result.resetAt,
          },
        },
        timestamp: Date.now(),
        meta: {
          duration: 0,
          rateLimit: {
            remaining: result.remaining,
            reset: result.resetAt,
          },
        },
      };
    }

    try {
      const response = await next();

      // Add rate limit headers to response
      if (!response.meta) {
        response.meta = { duration: 0 };
      }
      response.meta.rateLimit = {
        remaining: result.remaining,
        reset: result.resetAt,
      };

      return response;
    } finally {
      // Release concurrent slot
      limiter.releaseSlot(clientId);
    }
  };
}

// =============================================================================
// Default Helper Functions
// =============================================================================

/**
 * Default tier detection based on auth
 */
function defaultGetTier(request: ApiRequest): RateLimitTier {
  const auth = (request as any).auth;

  if (!auth || !auth.authenticated) {
    return 'anonymous';
  }

  if (auth.identity?.type === 'node') {
    return 'node';
  }

  if (auth.identity?.permissions?.includes('admin:system')) {
    return 'unlimited';
  }

  return 'authenticated';
}

/**
 * Default client ID extraction
 */
function defaultGetClientId(request: ApiRequest): string {
  // Try various sources for client identification
  return (
    request.clientId ||
    request.headers['x-client-id'] ||
    request.headers['x-forwarded-for']?.split(',')[0] ||
    request.headers['x-real-ip'] ||
    'unknown'
  );
}

// =============================================================================
// Distributed Rate Limiting (Theoretical)
// =============================================================================

/**
 * [THEORETICAL] Distributed rate limiter using Redis or similar
 * Would synchronize rate limits across multiple API instances
 */
export interface DistributedRateLimiterConfig extends RateLimitConfig {
  /** Redis connection URL */
  redisUrl: string;
  /** Key prefix */
  keyPrefix: string;
  /** Sync interval (ms) */
  syncInterval: number;
}

/**
 * [THEORETICAL] Would implement distributed rate limiting
 */
export class DistributedRateLimiter extends RateLimiter {
  // [THEORETICAL] Would extend basic rate limiter with:
  // - Redis-backed token bucket storage
  // - Lua scripts for atomic operations
  // - Periodic sync with local cache
  // - Graceful degradation to local-only mode
}

// =============================================================================
// Exports
// =============================================================================

export { DEFAULT_TIER_LIMITS };
