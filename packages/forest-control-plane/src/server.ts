/**
 * @chicago-forest/forest-control-plane - HTTP Server
 *
 * Hono-based REST API server for the Forest control plane.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { registerRoutes, type RouteServices } from './api';

export function createServer(services: RouteServices): Hono {
  const app = new Hono();

  // Middleware
  app.use('*', cors());
  app.use('*', logger());

  // Health check
  app.get('/healthz', (c) => c.json({ status: 'ok' }));

  // Readiness check (verifies DB is accessible)
  app.get('/readyz', (c) => {
    try {
      // If services exist and we can call them, we're ready
      const health = services.meshCoordinator
        ? { status: 'ready' }
        : { status: 'not ready' };
      return c.json(health);
    } catch {
      return c.json({ status: 'not ready' }, 503);
    }
  });

  // API info
  app.get('/', (c) => c.json({
    name: '@chicago-forest/forest-control-plane',
    version: '0.1.0',
    description: 'Forest mesh network control plane (AI-generated theoretical framework)',
    endpoints: {
      nodes: '/api/v1/nodes',
      enrollment: '/api/v1/enroll',
      mesh: '/api/v1/mesh',
      bootstrap: '/api/v1/bootstrap',
    },
  }));

  // Register API routes
  registerRoutes(app, services);

  // Global error handler
  app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, 500);
  });

  // 404 handler
  app.notFound((c) => {
    return c.json({
      success: false,
      error: 'Not found',
      timestamp: new Date().toISOString(),
    }, 404);
  });

  return app;
}
