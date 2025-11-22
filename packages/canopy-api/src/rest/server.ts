/**
 * @chicago-forest/canopy-api - REST API Server
 *
 * Main REST API server that integrates all routes, middleware, and handlers
 * for the Chicago Forest Network API.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. This server implementation demonstrates API patterns
 * but is not production-ready infrastructure.
 */

import { EventEmitter } from 'eventemitter3';
import type {
  ApiRequest,
  ApiResponse,
  CanopyConfig,
  CanopyEvents,
} from '../types';
import { nodeRoutes, type RouteDefinition } from './routes/nodes';
import { routingRoutes } from './routes/routing';
import { researchRoutes } from './routes/research';
import {
  createAuthMiddleware,
  createDefaultAuthConfig,
  type AuthConfig,
  type Middleware,
} from './middleware/auth';
import {
  RateLimiter,
  createRateLimitMiddleware,
} from './middleware/rate-limit';

// =============================================================================
// Types
// =============================================================================

/**
 * Server configuration
 */
export interface ServerConfig {
  /** Port to listen on */
  port: number;
  /** Host to bind to */
  host: string;
  /** Base path for API */
  basePath: string;
  /** Enable CORS */
  cors: boolean;
  /** CORS origins */
  corsOrigins: string[];
  /** Enable request logging */
  logging: boolean;
  /** Auth configuration */
  auth: Partial<AuthConfig>;
  /** Rate limit configuration */
  rateLimit: {
    enabled: boolean;
  };
  /** Request timeout (ms) */
  timeout: number;
}

/**
 * Route handler with metadata
 */
interface RegisteredRoute {
  method: string;
  path: string;
  fullPath: string;
  handler: (request: ApiRequest) => Promise<unknown>;
  auth: boolean;
  description: string;
  middleware: Middleware[];
}

/**
 * Server statistics
 */
export interface ServerStats {
  /** Total requests handled */
  totalRequests: number;
  /** Successful requests */
  successfulRequests: number;
  /** Failed requests */
  failedRequests: number;
  /** Average response time (ms) */
  avgResponseTime: number;
  /** Active connections */
  activeConnections: number;
  /** Registered routes */
  routeCount: number;
  /** Uptime (ms) */
  uptime: number;
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: ServerConfig = {
  port: 3000,
  host: '0.0.0.0',
  basePath: '/api/v1',
  cors: true,
  corsOrigins: ['*'],
  logging: true,
  auth: {},
  rateLimit: {
    enabled: true,
  },
  timeout: 30000,
};

// =============================================================================
// REST Server Class
// =============================================================================

/**
 * Chicago Forest REST API Server
 */
export class CanopyRestServer extends EventEmitter<CanopyEvents> {
  private config: ServerConfig;
  private routes: RegisteredRoute[] = [];
  private middleware: Middleware[] = [];
  private rateLimiter: RateLimiter;
  private startTime: number = 0;
  private stats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalResponseTime: number;
    activeConnections: number;
  } = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    activeConnections: 0,
  };

  constructor(config: Partial<ServerConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rateLimiter = new RateLimiter();

    // Initialize middleware
    this.initializeMiddleware();

    // Register all routes
    this.registerRoutes();
  }

  /**
   * Start the server
   * [THEORETICAL] Would start actual HTTP server
   */
  async start(): Promise<void> {
    this.startTime = Date.now();

    // [THEORETICAL] Would create HTTP server using native http or framework
    // For demonstration, we just log the startup

    console.log(`
===============================================
  Chicago Forest Network API Server
===============================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Base Path:   ${this.config.basePath}
  Port:        ${this.config.port}
  Host:        ${this.config.host}
  Routes:      ${this.routes.length}

  DISCLAIMER: Theoretical framework for
  educational and research purposes.
===============================================
`);

    this.emit('client:connected', 'server');
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    this.rateLimiter.stop();
    console.log('Server stopped');
  }

  /**
   * Handle incoming request
   */
  async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    const startTime = Date.now();
    this.stats.totalRequests++;
    this.stats.activeConnections++;

    this.emit('request:received', request);

    if (this.config.logging) {
      console.log(`[${new Date().toISOString()}] ${request.method} ${request.path}`);
    }

    try {
      // Apply middleware chain
      const response = await this.executeMiddlewareChain(request);

      const duration = Date.now() - startTime;
      this.stats.totalResponseTime += duration;

      if (response.success) {
        this.stats.successfulRequests++;
      } else {
        this.stats.failedRequests++;
      }

      // Ensure meta includes duration
      if (!response.meta) {
        response.meta = { duration };
      } else {
        response.meta.duration = duration;
      }

      this.emit('request:completed', request, response);

      return response;
    } catch (error) {
      this.stats.failedRequests++;
      const errorResponse: ApiResponse = {
        id: request.id,
        status: 500,
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: Date.now(),
        meta: {
          duration: Date.now() - startTime,
        },
      };

      this.emit('request:completed', request, errorResponse);
      return errorResponse;
    } finally {
      this.stats.activeConnections--;
    }
  }

  /**
   * Get registered routes
   */
  getRoutes(): Array<{ method: string; path: string; description: string }> {
    return this.routes.map(r => ({
      method: r.method,
      path: r.fullPath,
      description: r.description,
    }));
  }

  /**
   * Get server statistics
   */
  getStats(): ServerStats {
    return {
      totalRequests: this.stats.totalRequests,
      successfulRequests: this.stats.successfulRequests,
      failedRequests: this.stats.failedRequests,
      avgResponseTime: this.stats.totalRequests > 0
        ? this.stats.totalResponseTime / this.stats.totalRequests
        : 0,
      activeConnections: this.stats.activeConnections,
      routeCount: this.routes.length,
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
    };
  }

  /**
   * Register a custom route
   */
  registerRoute(
    method: string,
    path: string,
    handler: (request: ApiRequest) => Promise<unknown>,
    options: {
      auth?: boolean;
      description?: string;
      middleware?: Middleware[];
    } = {}
  ): void {
    const fullPath = this.config.basePath + path;
    this.routes.push({
      method: method.toUpperCase(),
      path,
      fullPath,
      handler,
      auth: options.auth ?? false,
      description: options.description || '',
      middleware: options.middleware || [],
    });
  }

  /**
   * Add global middleware
   */
  use(middleware: Middleware): void {
    this.middleware.push(middleware);
  }

  // Private methods

  private initializeMiddleware(): void {
    // CORS middleware (simulated)
    if (this.config.cors) {
      this.use(this.corsMiddleware.bind(this));
    }

    // Auth middleware
    const authConfig = createDefaultAuthConfig();
    Object.assign(authConfig, this.config.auth);
    this.use(createAuthMiddleware(authConfig));

    // Rate limiting middleware
    if (this.config.rateLimit.enabled) {
      this.use(createRateLimitMiddleware(this.rateLimiter));
    }

    // Request logging middleware
    if (this.config.logging) {
      this.use(this.loggingMiddleware.bind(this));
    }
  }

  private registerRoutes(): void {
    // Health and version routes
    this.registerRoute('GET', '/health', async () => ({
      status: 'healthy',
      timestamp: Date.now(),
      version: '0.1.0',
      disclaimer: 'AI-generated theoretical framework for educational purposes',
    }), { description: 'Health check endpoint' });

    this.registerRoute('GET', '/version', async () => ({
      version: '0.1.0',
      name: '@chicago-forest/canopy-api',
      theoretical: true,
    }), { description: 'API version information' });

    // Register node routes
    this.registerRouteDefinitions(nodeRoutes);

    // Register routing routes
    this.registerRouteDefinitions(routingRoutes);

    // Register research routes
    this.registerRouteDefinitions(researchRoutes);

    // API documentation route
    this.registerRoute('GET', '/docs', async () => ({
      message: 'API Documentation',
      openApiSpec: '/api/v1/docs/openapi.yaml',
      routes: this.getRoutes(),
      disclaimer: 'This is an AI-generated theoretical framework',
    }), { description: 'API documentation' });
  }

  private registerRouteDefinitions(definitions: RouteDefinition[]): void {
    for (const def of definitions) {
      this.registerRoute(
        def.method,
        def.path,
        def.handler,
        {
          auth: def.auth,
          description: def.description,
        }
      );
    }
  }

  private async executeMiddlewareChain(request: ApiRequest): Promise<ApiResponse> {
    let index = 0;
    const middlewareStack = [...this.middleware];

    const executeNext = async (): Promise<ApiResponse> => {
      if (index < middlewareStack.length) {
        const mw = middlewareStack[index++];
        return mw(request, executeNext);
      }

      // All middleware executed, now handle the route
      return this.routeHandler(request);
    };

    return executeNext();
  }

  private async routeHandler(request: ApiRequest): Promise<ApiResponse> {
    // Find matching route
    const route = this.findRoute(request.method, request.path);

    if (!route) {
      return {
        id: request.id,
        status: 404,
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Endpoint ${request.method} ${request.path} not found`,
        },
        timestamp: Date.now(),
      };
    }

    // Execute route-specific middleware
    for (const mw of route.middleware) {
      const result = await mw(request, async () => ({
        id: request.id,
        status: 200,
        success: true,
        timestamp: Date.now(),
      }));

      if (!result.success) {
        return result;
      }
    }

    // Execute handler
    const data = await route.handler(request);

    return {
      id: request.id,
      status: 200,
      success: true,
      data,
      timestamp: Date.now(),
    };
  }

  private findRoute(method: string, path: string): RegisteredRoute | undefined {
    // Remove base path if present
    const normalizedPath = path.startsWith(this.config.basePath)
      ? path.slice(this.config.basePath.length)
      : path;

    return this.routes.find(r => {
      if (r.method !== method.toUpperCase()) return false;
      return this.matchPath(r.path, normalizedPath);
    });
  }

  private matchPath(template: string, path: string): boolean {
    const templateParts = template.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (templateParts.length !== pathParts.length) return false;

    return templateParts.every((part, i) =>
      part.startsWith(':') || part === pathParts[i]
    );
  }

  private async corsMiddleware(
    request: ApiRequest,
    next: () => Promise<ApiResponse>
  ): Promise<ApiResponse> {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return {
        id: request.id,
        status: 204,
        success: true,
        timestamp: Date.now(),
      };
    }

    const response = await next();

    // Add CORS headers (would be added to HTTP response in real impl)
    (response as any).corsHeaders = {
      'Access-Control-Allow-Origin': this.config.corsOrigins.join(', '),
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    };

    return response;
  }

  private async loggingMiddleware(
    request: ApiRequest,
    next: () => Promise<ApiResponse>
  ): Promise<ApiResponse> {
    const start = Date.now();
    const response = await next();
    const duration = Date.now() - start;

    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.path} ` +
      `${response.status} ${duration}ms`
    );

    return response;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new Canopy REST server
 */
export function createRestServer(
  config?: Partial<ServerConfig>
): CanopyRestServer {
  return new CanopyRestServer(config);
}

// =============================================================================
// Exports
// =============================================================================

export { nodeRoutes, routingRoutes, researchRoutes };
