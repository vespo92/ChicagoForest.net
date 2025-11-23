/**
 * Forest SDK - Client library for interacting with the network
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes.
 */

import type { NodeId } from '@chicago-forest/shared-types';
import type {
  ApiRequest,
  ApiResponse,
  IdentityInfo,
  NetworkStats,
  StorageInfo,
  StoredObject,
} from '../types';

// Re-export all SDK modules
export * from './client';
export * from './node-manager';
export * from './research-api';
export * from './governance-client';
export * from './storage-client';

/**
 * SDK Configuration
 */
export interface SdkConfig {
  /** API endpoint URL */
  endpoint: string;

  /** WebSocket endpoint URL */
  wsEndpoint?: string;

  /** API key for authentication */
  apiKey?: string;

  /** Request timeout (ms) */
  timeout: number;

  /** Enable automatic reconnection */
  autoReconnect: boolean;

  /** Retry configuration */
  retry: RetryConfig;
}

export interface RetryConfig {
  /** Maximum retries */
  maxRetries: number;

  /** Initial delay (ms) */
  initialDelay: number;

  /** Maximum delay (ms) */
  maxDelay: number;

  /** Delay multiplier */
  multiplier: number;
}

const DEFAULT_CONFIG: SdkConfig = {
  endpoint: 'http://localhost:3000/api',
  timeout: 30000,
  autoReconnect: true,
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    multiplier: 2,
  },
};

/**
 * Forest Network SDK Client
 */
export class ForestClient {
  private config: SdkConfig;
  private headers: Record<string, string> = {};

  constructor(config: Partial<SdkConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.apiKey) {
      this.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
  }

  // === Identity API ===

  /**
   * Get local node identity
   */
  async getIdentity(): Promise<IdentityInfo> {
    return this.get<IdentityInfo>('/identity');
  }

  /**
   * Get identity of a specific node
   */
  async getNodeIdentity(nodeId: NodeId): Promise<IdentityInfo | null> {
    try {
      return await this.get<IdentityInfo>(`/identity/${nodeId}`);
    } catch {
      return null;
    }
  }

  // === Network API ===

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<NetworkStats> {
    return this.get<NetworkStats>('/network/stats');
  }

  /**
   * Get connected peers
   */
  async getPeers(): Promise<NodeId[]> {
    return this.get<NodeId[]>('/network/peers');
  }

  /**
   * Connect to a peer
   */
  async connectPeer(address: string): Promise<boolean> {
    const result = await this.post<{ success: boolean }>('/network/connect', { address });
    return result.success;
  }

  /**
   * Disconnect from a peer
   */
  async disconnectPeer(nodeId: NodeId): Promise<boolean> {
    const result = await this.post<{ success: boolean }>('/network/disconnect', { nodeId });
    return result.success;
  }

  // === Storage API ===

  /**
   * Get storage information
   */
  async getStorageInfo(): Promise<StorageInfo> {
    return this.get<StorageInfo>('/storage/info');
  }

  /**
   * Store data in the network
   */
  async store(data: Uint8Array | string, options?: StoreOptions): Promise<StoredObject> {
    const body = typeof data === 'string' ? data : Buffer.from(data).toString('base64');
    return this.post<StoredObject>('/storage/store', { data: body, ...options });
  }

  /**
   * Retrieve data from the network
   */
  async retrieve(id: string): Promise<Uint8Array | null> {
    try {
      const result = await this.get<{ data: string }>(`/storage/${id}`);
      return Buffer.from(result.data, 'base64');
    } catch {
      return null;
    }
  }

  /**
   * Delete stored data
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.request<{ success: boolean }>('DELETE', `/storage/${id}`);
    return result.success;
  }

  // === Messaging API ===

  /**
   * Send a message to a node
   */
  async sendMessage(to: NodeId, message: unknown): Promise<boolean> {
    const result = await this.post<{ success: boolean }>('/messaging/send', { to, message });
    return result.success;
  }

  /**
   * Broadcast a message to the network
   */
  async broadcast(topic: string, message: unknown): Promise<boolean> {
    const result = await this.post<{ success: boolean }>('/messaging/broadcast', { topic, message });
    return result.success;
  }

  // === Governance API ===

  /**
   * Get active proposals
   */
  async getProposals(): Promise<unknown[]> {
    return this.get<unknown[]>('/governance/proposals');
  }

  /**
   * Create a proposal
   */
  async createProposal(proposal: CreateProposalRequest): Promise<string> {
    const result = await this.post<{ id: string }>('/governance/proposals', proposal);
    return result.id;
  }

  /**
   * Cast a vote
   */
  async vote(proposalId: string, choice: 'approve' | 'reject' | 'abstain'): Promise<boolean> {
    const result = await this.post<{ success: boolean }>('/governance/vote', { proposalId, choice });
    return result.success;
  }

  // === Utility ===

  /**
   * Check if the API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.get<{ status: string }>('/health');
      return result.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Get API version
   */
  async getVersion(): Promise<string> {
    const result = await this.get<{ version: string }>('/version');
    return result.version;
  }

  // === Private methods ===

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.config.endpoint}${path}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // Simulate fetch for now (would use actual fetch in browser/node)
    const response = await this.simulateFetch(url, options);

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Request failed');
    }

    return response.data as T;
  }

  private async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  private async simulateFetch(url: string, options: RequestInit): Promise<ApiResponse> {
    // Simulated response for demonstration
    // In real implementation, would use fetch or axios
    return {
      id: 'req_' + Date.now(),
      status: 200,
      success: true,
      data: {},
      timestamp: Date.now(),
    };
  }
}

export interface StoreOptions {
  /** TTL in seconds */
  ttl?: number;

  /** Replication factor */
  replication?: number;

  /** Encryption */
  encrypt?: boolean;
}

export interface CreateProposalRequest {
  type: string;
  title: string;
  description: string;
  payload?: unknown;
}

/**
 * Create a new Forest client
 */
export function createClient(config?: Partial<SdkConfig>): ForestClient {
  return new ForestClient(config);
}
