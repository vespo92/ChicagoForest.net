/**
 * @chicago-forest/forest-control-plane - Mesh API Routes
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { Hono } from 'hono';
import type { MeshCoordinator } from '../services/mesh-coordinator';

export function createMeshRoutes(meshCoordinator: MeshCoordinator): Hono {
  const app = new Hono();

  // Get mesh topology
  app.get('/topology', (c) => {
    const topology = meshCoordinator.getTopology();
    return c.json({ success: true, data: topology, timestamp: new Date().toISOString() });
  });

  // Get mesh health summary
  app.get('/health', (c) => {
    const health = meshCoordinator.getHealth();
    return c.json({ success: true, data: health, timestamp: new Date().toISOString() });
  });

  // Get default mesh config (for manual provisioning)
  app.get('/config', (c) => {
    const config = meshCoordinator.getDefaultMeshConfig();
    return c.json({ success: true, data: config, timestamp: new Date().toISOString() });
  });

  return app;
}
