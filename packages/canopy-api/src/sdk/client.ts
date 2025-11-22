/**
 * @chicago-forest/canopy-api - SDK Client
 *
 * TypeScript client for interacting with the Chicago Forest Network API.
 * Provides a typed, easy-to-use interface for all API operations.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. The SDK represents a conceptual client for a
 * decentralized energy network API.
 */

import type { NodeId, NodeCapability, PeerInfo } from '@chicago-forest/shared-types';

// =============================================================================
// Types
// =============================================================================

/**
 * SDK Configuration
 */
export interface CanopyClientConfig {
  /** REST API base URL */
  baseUrl: string;
  /** WebSocket URL for real-time updates */
  wsUrl?: string;
  /** API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable automatic reconnection for WebSocket */
  autoReconnect: boolean;
  /** Retry configuration */
  retry: RetryConfig;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Enable debug logging */
  debug: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retries */
  maxRetries: number;
  /** Initial retry delay in ms */
  initialDelay: number;
  /** Maximum retry delay in ms */
  maxDelay: number;
  /** Backoff multiplier */
  multiplier: number;
  /** HTTP status codes to retry */
  retryableStatuses: number[];
}

/**
 * API response wrapper
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId: string;
    duration: number;
    rateLimit?: {
      remaining: number;
      reset: number;
    };
  };
}

/**
 * Request options
 */
export interface RequestOptions {
  /** Override timeout for this request */
  timeout?: number;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Skip retry for this request */
  noRetry?: boolean;
  /** Abort signal */
  signal?: AbortSignal;
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: CanopyClientConfig = {
  baseUrl: 'http://localhost:3000/api/v1',
  timeout: 30000,
  autoReconnect: true,
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    multiplier: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
  debug: false,
};

// =============================================================================
// Canopy Client
// =============================================================================

/**
 * Chicago Forest Network SDK Client
 *
 * Main client class for interacting with the Canopy API.
 * Provides methods for all API operations with full TypeScript support.
 *
 * @example
 * ```typescript
 * const client = new CanopyClient({
 *   baseUrl: 'https://api.chicago-forest.network',
 *   apiKey: 'cfn_your_api_key',
 * });
 *
 * // Get network stats
 * const stats = await client.getNetworkStats();
 *
 * // List nodes
 * const nodes = await client.listNodes({ capabilities: ['relay'] });
 * ```
 */
export class CanopyClient {
  private config: CanopyClientConfig;
  private defaultHeaders: Record<string, string>;

  constructor(config: Partial<CanopyClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.config.headers,
    };

    if (this.config.apiKey) {
      this.defaultHeaders['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
  }

  // ===========================================================================
  // Health & Info
  // ===========================================================================

  /**
   * Check API health
   */
  async health(): Promise<ApiResult<{ status: string; version: string }>> {
    return this.get('/health');
  }

  /**
   * Get API version
   */
  async version(): Promise<ApiResult<{ version: string; name: string }>> {
    return this.get('/version');
  }

  // ===========================================================================
  // Nodes API
  // ===========================================================================

  /**
   * List nodes in the network
   */
  async listNodes(filter?: {
    capabilities?: NodeCapability[];
    minReputation?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApiResult<NodeListResponse>> {
    const params = new URLSearchParams();
    if (filter?.capabilities) params.set('capabilities', filter.capabilities.join(','));
    if (filter?.minReputation) params.set('minReputation', String(filter.minReputation));
    if (filter?.limit) params.set('limit', String(filter.limit));
    if (filter?.offset) params.set('offset', String(filter.offset));

    const query = params.toString();
    return this.get(`/nodes${query ? `?${query}` : ''}`);
  }

  /**
   * Get a specific node
   */
  async getNode(nodeId: NodeId): Promise<ApiResult<NodeInfo>> {
    return this.get(`/nodes/${nodeId}`);
  }

  /**
   * Register a new node
   * [THEORETICAL] Would add node to distributed registry
   */
  async registerNode(data: {
    publicKey: string;
    name?: string;
    capabilities: NodeCapability[];
  }): Promise<ApiResult<RegisterNodeResponse>> {
    return this.post('/nodes/register', data);
  }

  /**
   * Update node status (heartbeat)
   */
  async updateStatus(data: {
    health: 'healthy' | 'degraded' | 'offline';
    load: number;
    capacity: { bandwidth: number; storage: number; compute: number };
  }): Promise<ApiResult<{ success: boolean; nextHeartbeat: number }>> {
    return this.put('/nodes/status', data);
  }

  /**
   * Get node metrics
   */
  async getNodeMetrics(nodeId: NodeId): Promise<ApiResult<NodeMetrics>> {
    return this.get(`/nodes/${nodeId}/metrics`);
  }

  /**
   * Get node peers
   */
  async getNodePeers(nodeId: NodeId): Promise<ApiResult<PeerInfo[]>> {
    return this.get(`/nodes/${nodeId}/peers`);
  }

  // ===========================================================================
  // Routing API
  // ===========================================================================

  /**
   * Get routing table
   */
  async getRoutingTable(): Promise<ApiResult<RoutingTableResponse>> {
    return this.get('/routing/table');
  }

  /**
   * Discover paths to destination
   */
  async discoverPath(
    destination: NodeId,
    preferences?: {
      lowLatency?: boolean;
      highBandwidth?: boolean;
      anonymous?: boolean;
      maxHops?: number;
    }
  ): Promise<ApiResult<DiscoveredPath[]>> {
    return this.post('/routing/discover', { destination, preferences });
  }

  /**
   * Get mesh neighbors
   */
  async getNeighbors(): Promise<ApiResult<LinkQualityInfo[]>> {
    return this.get('/routing/neighbors');
  }

  /**
   * Get active tunnels
   */
  async getTunnels(): Promise<ApiResult<TunnelInfo[]>> {
    return this.get('/routing/tunnels');
  }

  /**
   * Get traffic statistics
   */
  async getTrafficStats(period?: number): Promise<ApiResult<TrafficStats>> {
    const query = period ? `?period=${period}` : '';
    return this.get(`/routing/traffic${query}`);
  }

  /**
   * Get traffic rules
   */
  async getTrafficRules(): Promise<ApiResult<TrafficRule[]>> {
    return this.get('/routing/rules');
  }

  /**
   * Create traffic rule
   */
  async createTrafficRule(rule: Omit<TrafficRule, 'id'>): Promise<ApiResult<{ id: string }>> {
    return this.post('/routing/rules', rule);
  }

  /**
   * Delete traffic rule
   */
  async deleteTrafficRule(ruleId: string): Promise<ApiResult<{ success: boolean }>> {
    return this.delete(`/routing/rules/${ruleId}`);
  }

  /**
   * Trigger route optimization
   * [THEORETICAL]
   */
  async optimizeRoutes(aggressive?: boolean): Promise<ApiResult<OptimizationResult>> {
    return this.post('/routing/optimize', { aggressive });
  }

  // ===========================================================================
  // Network Stats
  // ===========================================================================

  /**
   * Get network-wide statistics
   */
  async getNetworkStats(): Promise<ApiResult<NetworkStats>> {
    return this.get('/network/stats');
  }

  /**
   * Connect to a peer
   */
  async connectPeer(address: string): Promise<ApiResult<{ success: boolean }>> {
    return this.post('/network/connect', { address });
  }

  /**
   * Disconnect from a peer
   */
  async disconnectPeer(nodeId: NodeId): Promise<ApiResult<{ success: boolean }>> {
    return this.post('/network/disconnect', { nodeId });
  }

  // ===========================================================================
  // HTTP Methods
  // ===========================================================================

  private async get<T>(path: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  private async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('POST', path, body, options);
  }

  private async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  private async delete<T>(path: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResult<T>> {
    const url = `${this.config.baseUrl}${path}`;
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
      'X-Request-ID': requestId,
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: options.signal,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    let lastError: Error | null = null;
    let attempts = 0;
    const maxAttempts = options.noRetry ? 1 : this.config.retry.maxRetries + 1;

    while (attempts < maxAttempts) {
      try {
        if (this.config.debug) {
          console.log(`[CanopySDK] ${method} ${path} (attempt ${attempts + 1})`);
        }

        // Use simulated fetch for demonstration
        const response = await this.simulatedFetch(url, fetchOptions, method, path);

        const duration = Date.now() - startTime;

        if (this.config.debug) {
          console.log(`[CanopySDK] ${method} ${path} completed in ${duration}ms`);
        }

        return {
          success: true,
          data: response as T,
          meta: {
            requestId,
            duration,
          },
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts++;

        if (attempts < maxAttempts) {
          const delay = Math.min(
            this.config.retry.initialDelay * Math.pow(this.config.retry.multiplier, attempts - 1),
            this.config.retry.maxDelay
          );

          if (this.config.debug) {
            console.log(`[CanopySDK] Retrying in ${delay}ms...`);
          }

          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'REQUEST_FAILED',
        message: lastError?.message || 'Request failed',
      },
      meta: {
        requestId,
        duration: Date.now() - startTime,
      },
    };
  }

  /**
   * Simulated fetch for demonstration
   * [THEORETICAL] Would use actual fetch in production
   */
  private async simulatedFetch(
    url: string,
    options: RequestInit,
    method: string,
    path: string
  ): Promise<unknown> {
    // Simulate network delay
    await this.sleep(50 + Math.random() * 100);

    // Return mock data based on path
    if (path === '/health') {
      return { status: 'healthy', version: '0.1.0' };
    }

    if (path === '/version') {
      return { version: '0.1.0', name: '@chicago-forest/canopy-api' };
    }

    if (path.startsWith('/nodes') && method === 'GET' && !path.includes('/')) {
      return {
        nodes: [],
        total: 0,
        page: 1,
        pageSize: 50,
      };
    }

    if (path === '/network/stats') {
      return {
        connectedPeers: 42,
        activePaths: 128,
        bandwidth: { incoming: 1000000, outgoing: 800000, total: 1800000 },
        latency: { min: 5, max: 200, avg: 45, p95: 100 },
      };
    }

    // Default response
    return {};
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Response Types
// =============================================================================

export interface NodeListResponse {
  nodes: NodeInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NodeInfo {
  nodeId: NodeId;
  publicKey: string;
  name?: string;
  capabilities: NodeCapability[];
  reputation: number;
  status: 'online' | 'offline' | 'unknown';
  lastSeen: number;
  uptime: number;
  connections: number;
}

export interface RegisterNodeResponse {
  nodeId: NodeId;
  registeredAt: number;
  bootstrapPeers: PeerInfo[];
  segment: string;
}

export interface NodeMetrics {
  bandwidthIn: number;
  bandwidthOut: number;
  tunnelCount: number;
  anonymousCircuits: number;
}

export interface RoutingTableResponse {
  protocol: string;
  routeCount: number;
  routes: RouteInfo[];
  lastUpdate: number;
  neighborCount: number;
}

export interface RouteInfo {
  id: string;
  destination: string;
  nextHop: NodeId;
  metric: number;
  hopCount: number;
  latency: number;
  bandwidth: number;
  protocol: string;
  active: boolean;
}

export interface DiscoveredPath {
  pathId: string;
  hops: { nodeId: NodeId; address: string; latency: number }[];
  totalLatency: number;
  minBandwidth: number;
  reliability: number;
  anonymous: boolean;
  expiresAt: number;
}

export interface LinkQualityInfo {
  peerId: NodeId;
  rssi: number;
  snr: number;
  quality: number;
  txRate: number;
  rxRate: number;
}

export interface TunnelInfo {
  id: string;
  type: string;
  status: 'up' | 'down' | 'error';
  remoteEndpoint: string;
  bytesIn: number;
  bytesOut: number;
  lastHandshake?: number;
}

export interface TrafficStats {
  timestamp: number;
  period: number;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  packetsDropped: number;
}

export interface TrafficRule {
  id: string;
  name: string;
  priority: number;
  match: Record<string, unknown>;
  action: Record<string, unknown>;
}

export interface OptimizationResult {
  optimized: boolean;
  changes: number;
  improvement: { latency: number; bandwidth: number };
}

export interface NetworkStats {
  connectedPeers: number;
  activePaths: number;
  bandwidth: { incoming: number; outgoing: number; total: number };
  latency: { min: number; max: number; avg: number; p95: number };
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new Canopy client
 */
export function createClient(config?: Partial<CanopyClientConfig>): CanopyClient {
  return new CanopyClient(config);
}
