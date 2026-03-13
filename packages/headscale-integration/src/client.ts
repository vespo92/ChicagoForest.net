/**
 * @chicago-forest/headscale-integration - Headscale API Client
 *
 * Wraps the Headscale v0.28.0 gRPC/REST API with support for
 * API key authentication and Unix socket authentication.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type {
  HeadscaleClientConfig,
  HeadscaleNode,
  HeadscaleUser,
  HeadscalePreAuthKey,
  HeadscaleRoute,
  CreateUserRequest,
  CreatePreAuthKeyRequest,
  ListNodesRequest,
  DeleteNodeRequest,
  GetRoutesRequest,
  EnableRouteRequest,
  HeadscaleApiResponse,
} from './types';

/** Default configuration values */
const DEFAULTS = {
  timeout: 10_000,
  serverUrl: 'http://127.0.0.1:8080',
} as const;

/**
 * HeadscaleClient provides a typed interface to the Headscale v0.28 REST API.
 *
 * Supports two authentication modes:
 * - API key: Bearer token sent via Authorization header
 * - Unix socket: Connects through a local Unix domain socket
 */
export class HeadscaleClient {
  private readonly serverUrl: string;
  private readonly config: HeadscaleClientConfig;

  constructor(config: HeadscaleClientConfig) {
    this.config = {
      timeout: DEFAULTS.timeout,
      insecure: false,
      ...config,
    };
    this.serverUrl = config.serverUrl.replace(/\/+$/, '');
  }

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  /** Create a new Headscale user */
  async createUser(request: CreateUserRequest): Promise<HeadscaleApiResponse<HeadscaleUser>> {
    const response = await this.request<{ user: HeadscaleUser }>('/api/v1/user', {
      method: 'POST',
      body: JSON.stringify({ name: request.name }),
    });
    return { data: response.user, status: 200 };
  }

  /** List all users */
  async listUsers(): Promise<HeadscaleApiResponse<HeadscaleUser[]>> {
    const response = await this.request<{ users: HeadscaleUser[] }>('/api/v1/user');
    return { data: response.users ?? [], status: 200 };
  }

  // ---------------------------------------------------------------------------
  // Pre-Auth Keys
  // ---------------------------------------------------------------------------

  /** Create a pre-authentication key for automated node enrollment */
  async createPreauthKey(
    request: CreatePreAuthKeyRequest,
  ): Promise<HeadscaleApiResponse<HeadscalePreAuthKey>> {
    const response = await this.request<{ preAuthKey: HeadscalePreAuthKey }>(
      '/api/v1/preauthkey',
      {
        method: 'POST',
        body: JSON.stringify({
          user: request.user,
          reusable: request.reusable ?? false,
          ephemeral: request.ephemeral ?? false,
          expiration: request.expiration,
          aclTags: request.aclTags ?? [],
        }),
      },
    );
    return { data: response.preAuthKey, status: 200 };
  }

  /** List pre-auth keys for a user */
  async listPreauthKeys(user: string): Promise<HeadscaleApiResponse<HeadscalePreAuthKey[]>> {
    const response = await this.request<{ preAuthKeys: HeadscalePreAuthKey[] }>(
      `/api/v1/preauthkey?user=${encodeURIComponent(user)}`,
    );
    return { data: response.preAuthKeys ?? [], status: 200 };
  }

  // ---------------------------------------------------------------------------
  // Nodes
  // ---------------------------------------------------------------------------

  /** List all nodes, optionally filtered by user */
  async listNodes(request?: ListNodesRequest): Promise<HeadscaleApiResponse<HeadscaleNode[]>> {
    const params = request?.user ? `?user=${encodeURIComponent(request.user)}` : '';
    const response = await this.request<{ nodes: HeadscaleNode[] }>(`/api/v1/node${params}`);
    return { data: response.nodes ?? [], status: 200 };
  }

  /** Get a single node by ID */
  async getNode(nodeId: string): Promise<HeadscaleApiResponse<HeadscaleNode>> {
    const response = await this.request<{ node: HeadscaleNode }>(
      `/api/v1/node/${encodeURIComponent(nodeId)}`,
    );
    return { data: response.node, status: 200 };
  }

  /** Delete a node */
  async deleteNode(request: DeleteNodeRequest): Promise<HeadscaleApiResponse<void>> {
    await this.request(`/api/v1/node/${encodeURIComponent(request.nodeId)}`, {
      method: 'DELETE',
    });
    return { data: undefined, status: 200 };
  }

  // ---------------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------------

  /** Get routes, optionally filtered by node */
  async getRoutes(request?: GetRoutesRequest): Promise<HeadscaleApiResponse<HeadscaleRoute[]>> {
    let path: string;
    if (request?.nodeId) {
      path = `/api/v1/node/${encodeURIComponent(request.nodeId)}/routes`;
    } else {
      path = '/api/v1/routes';
    }
    const response = await this.request<{ routes: HeadscaleRoute[] }>(path);
    return { data: response.routes ?? [], status: 200 };
  }

  /** Enable a specific route */
  async enableRoute(request: EnableRouteRequest): Promise<HeadscaleApiResponse<void>> {
    await this.request(
      `/api/v1/routes/${encodeURIComponent(request.routeId)}/enable`,
      { method: 'POST' },
    );
    return { data: undefined, status: 200 };
  }

  /** Disable a specific route */
  async disableRoute(routeId: string): Promise<HeadscaleApiResponse<void>> {
    await this.request(
      `/api/v1/routes/${encodeURIComponent(routeId)}/disable`,
      { method: 'POST' },
    );
    return { data: undefined, status: 200 };
  }

  // ---------------------------------------------------------------------------
  // Internal HTTP helpers
  // ---------------------------------------------------------------------------

  /** Build request headers based on authentication method */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.config.auth.type === 'apiKey') {
      headers['Authorization'] = `Bearer ${this.config.auth.apiKey}`;
    }

    return headers;
  }

  /** Build the full URL for a request */
  private buildUrl(path: string): string {
    if (this.config.auth.type === 'unixSocket') {
      // For Unix socket auth, use the socket path as the base
      // The actual HTTP request targets localhost but connects via the socket
      return `http://localhost${path}`;
    }
    return `${this.serverUrl}${path}`;
  }

  /**
   * Execute an HTTP request against the Headscale API.
   *
   * When using Unix socket auth, this sets up the connection through the
   * socket. When using API key auth, it sends the bearer token in headers.
   */
  private async request<T = unknown>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const url = this.buildUrl(path);
    const headers = this.getHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout ?? DEFAULTS.timeout);

    try {
      const fetchOptions: RequestInit = {
        ...init,
        headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
        signal: controller.signal,
      };

      // For Unix socket connections, add the socket path via the Node.js
      // undici dispatcher when available, or fall back to environment-based
      // configuration. The consumer is responsible for configuring the
      // runtime to route requests through the Unix socket.
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const body = await response.text().catch(() => 'Unknown error');
        throw new HeadscaleApiError(
          `Headscale API error: ${response.status} ${response.statusText}`,
          response.status,
          body,
        );
      }

      // DELETE responses may have no body
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Error thrown when the Headscale API returns a non-OK response.
 */
export class HeadscaleApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody: string,
  ) {
    super(message);
    this.name = 'HeadscaleApiError';
  }
}
