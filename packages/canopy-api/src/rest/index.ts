/**
 * REST API Handler - HTTP endpoints for the forest
 *
 * @chicago-forest/canopy-api REST Module
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Not operational infrastructure.
 */

import { EventEmitter } from 'eventemitter3';
import type {
  ApiRequest,
  ApiResponse,
  ApiError,
  CanopyConfig,
  CanopyEvents,
  IdentityInfo,
  NetworkStats,
  StorageInfo,
} from '../types';

// Export routes
export * from './routes/nodes';
export * from './routes/routing';
export * from './routes/research';

// Export middleware
export * from './middleware/auth';
export * from './middleware/rate-limit';

// Export server
export { CanopyRestServer, createRestServer, type ServerConfig, type ServerStats } from './server';

/**
 * Route handler type
 */
export type RouteHandler<T = unknown> = (
  request: ApiRequest
) => Promise<T>;

/**
 * Route definition
 */
interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  auth: boolean;
}

/**
 * REST API server
 */
export class RestApiServer extends EventEmitter<CanopyEvents> {
  private config: Partial<CanopyConfig>;
  private routes: Route[] = [];
  private rateLimitMap: Map<string, { count: number; reset: number }> = new Map();

  constructor(config: Partial<CanopyConfig> = {}) {
    super();
    this.config = config;
    this.registerDefaultRoutes();
  }

  /**
   * Register a route
   */
  register<T>(
    method: string,
    path: string,
    handler: RouteHandler<T>,
    options: { auth?: boolean } = {}
  ): void {
    this.routes.push({
      method,
      path,
      handler: handler as RouteHandler,
      auth: options.auth ?? false,
    });
  }

  /**
   * Handle an incoming request
   */
  async handle(request: ApiRequest): Promise<ApiResponse> {
    const startTime = Date.now();
    this.emit('request:received', request);

    try {
      // Rate limiting
      if (this.config.rateLimit?.enabled) {
        const limited = this.checkRateLimit(request.clientId ?? 'anonymous');
        if (limited) {
          this.emit('ratelimit:exceeded', request.clientId ?? 'anonymous');
          return this.errorResponse(request.id, 429, 'RATE_LIMITED', 'Too many requests');
        }
      }

      // Find matching route
      const route = this.findRoute(request.method, request.path);
      if (!route) {
        return this.errorResponse(request.id, 404, 'NOT_FOUND', 'Endpoint not found');
      }

      // Check authentication
      if (route.auth && this.config.authEnabled) {
        const authValid = this.checkAuth(request);
        if (!authValid) {
          return this.errorResponse(request.id, 401, 'UNAUTHORIZED', 'Authentication required');
        }
      }

      // Execute handler
      const data = await route.handler(request);

      const response: ApiResponse = {
        id: request.id,
        status: 200,
        success: true,
        data,
        timestamp: Date.now(),
        meta: {
          duration: Date.now() - startTime,
        },
      };

      this.emit('request:completed', request, response);
      return response;
    } catch (error) {
      return this.errorResponse(
        request.id,
        500,
        'INTERNAL_ERROR',
        String(error)
      );
    }
  }

  /**
   * Get all registered routes
   */
  getRoutes(): { method: string; path: string }[] {
    return this.routes.map(r => ({ method: r.method, path: r.path }));
  }

  // Private methods

  private registerDefaultRoutes(): void {
    // Identity routes
    this.register('GET', '/identity', this.getIdentity.bind(this));
    this.register('GET', '/identity/:nodeId', this.getNodeIdentity.bind(this));

    // Network routes
    this.register('GET', '/network/stats', this.getNetworkStats.bind(this));
    this.register('GET', '/network/peers', this.getPeers.bind(this));
    this.register('POST', '/network/connect', this.connectPeer.bind(this), { auth: true });

    // Storage routes
    this.register('GET', '/storage/info', this.getStorageInfo.bind(this));
    this.register('POST', '/storage/store', this.storeData.bind(this), { auth: true });
    this.register('GET', '/storage/:id', this.retrieveData.bind(this));

    // Governance routes
    this.register('GET', '/governance/proposals', this.getProposals.bind(this));
    this.register('POST', '/governance/proposals', this.createProposal.bind(this), { auth: true });
    this.register('POST', '/governance/vote', this.castVote.bind(this), { auth: true });

    // Health routes
    this.register('GET', '/health', this.healthCheck.bind(this));
    this.register('GET', '/version', this.getVersion.bind(this));
  }

  private findRoute(method: string, path: string): Route | undefined {
    return this.routes.find(r => {
      if (r.method !== method) return false;

      // Simple path matching (supports :param)
      const routeParts = r.path.split('/');
      const pathParts = path.split('/');

      if (routeParts.length !== pathParts.length) return false;

      return routeParts.every((part, i) =>
        part.startsWith(':') || part === pathParts[i]
      );
    });
  }

  private checkAuth(request: ApiRequest): boolean {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    return token === this.config.apiKey;
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const limit = this.config.rateLimit!;
    let state = this.rateLimitMap.get(clientId);

    if (!state || now > state.reset) {
      state = { count: 0, reset: now + 60000 };
      this.rateLimitMap.set(clientId, state);
    }

    state.count++;
    return state.count > limit.requestsPerMinute;
  }

  private errorResponse(
    requestId: string,
    status: number,
    code: string,
    message: string
  ): ApiResponse {
    return {
      id: requestId,
      status,
      success: false,
      error: { code, message },
      timestamp: Date.now(),
    };
  }

  // Route handlers

  private async getIdentity(): Promise<IdentityInfo> {
    return {
      nodeId: 'local-node' as any,
      publicKey: 'pk_...',
      reputation: 0.8,
      createdAt: Date.now(),
    };
  }

  private async getNodeIdentity(request: ApiRequest): Promise<IdentityInfo | null> {
    // Would look up node by ID
    return null;
  }

  private async getNetworkStats(): Promise<NetworkStats> {
    return {
      connectedPeers: 42,
      activePaths: 128,
      bandwidth: { incoming: 1000000, outgoing: 800000, total: 1800000 },
      latency: { min: 5, max: 200, avg: 45, p95: 100 },
    };
  }

  private async getPeers(): Promise<unknown[]> {
    return [];
  }

  private async connectPeer(request: ApiRequest): Promise<{ success: boolean }> {
    return { success: true };
  }

  private async getStorageInfo(): Promise<StorageInfo> {
    return {
      available: 100_000_000_000,
      used: 10_000_000_000,
      total: 110_000_000_000,
    };
  }

  private async storeData(request: ApiRequest): Promise<{ id: string }> {
    return { id: 'stored_' + Date.now() };
  }

  private async retrieveData(request: ApiRequest): Promise<unknown> {
    return null;
  }

  private async getProposals(): Promise<unknown[]> {
    return [];
  }

  private async createProposal(request: ApiRequest): Promise<{ id: string }> {
    return { id: 'prop_' + Date.now() };
  }

  private async castVote(request: ApiRequest): Promise<{ success: boolean }> {
    return { success: true };
  }

  private async healthCheck(): Promise<{ status: string }> {
    return { status: 'healthy' };
  }

  private async getVersion(): Promise<{ version: string }> {
    return { version: '0.1.0' };
  }
}
