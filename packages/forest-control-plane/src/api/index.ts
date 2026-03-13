/**
 * @chicago-forest/forest-control-plane - API Route Registration
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { Hono } from 'hono';
import { createNodeRoutes } from './nodes';
import { createEnrollmentRoutes } from './enrollment';
import { createMeshRoutes } from './mesh';
import { createBootstrapRoutes } from './bootstrap';
import type { NodeRegistry } from '../services/node-registry';
import type { EnrollmentService } from '../services/enrollment';
import type { MeshCoordinator } from '../services/mesh-coordinator';
import type { BootstrapManager } from '../services/bootstrap-manager';
import type { WireGuardKeyService } from '../services/wireguard-keys';

export interface RouteServices {
  nodeRegistry: NodeRegistry;
  enrollmentService: EnrollmentService;
  meshCoordinator: MeshCoordinator;
  bootstrapManager: BootstrapManager;
  wgKeys: WireGuardKeyService;
}

export function registerRoutes(app: Hono, services: RouteServices): void {
  const api = new Hono();

  api.route('/nodes', createNodeRoutes(services.nodeRegistry, services.wgKeys));
  api.route('/enroll', createEnrollmentRoutes(services.enrollmentService));
  api.route('/mesh', createMeshRoutes(services.meshCoordinator));
  api.route('/bootstrap', createBootstrapRoutes(services.bootstrapManager));

  app.route('/api/v1', api);
}
