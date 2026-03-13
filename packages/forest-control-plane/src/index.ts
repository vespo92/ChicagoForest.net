/**
 * @chicago-forest/forest-control-plane - Main Entry Point
 *
 * Forest mesh network control plane service.
 * Manages node enrollment, mesh coordination, and bootstrap peers
 * on top of Headscale for WireGuard key exchange.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { serve } from '@hono/node-server';
import { loadConfig } from './config';
import { ForestStore } from './store/sqlite';
import { NodeRegistry } from './services/node-registry';
import { EnrollmentService } from './services/enrollment';
import { MeshCoordinator } from './services/mesh-coordinator';
import { BootstrapManager } from './services/bootstrap-manager';
import { WireGuardKeyService } from './services/wireguard-keys';
import { createServer } from './server';

// Re-export types and services for library consumers
export type { ForestCPConfig } from './config';
export { loadConfig } from './config';
export { ForestStore } from './store/sqlite';
export { NodeRegistry } from './services/node-registry';
export { EnrollmentService } from './services/enrollment';
export { MeshCoordinator } from './services/mesh-coordinator';
export { BootstrapManager } from './services/bootstrap-manager';
export { WireGuardKeyService } from './services/wireguard-keys';
export { createServer } from './server';
export * from './types';

async function main(): Promise<void> {
  console.log('=== Chicago Forest Control Plane ===');
  console.log('DISCLAIMER: AI-generated theoretical framework for research purposes.');
  console.log('');

  const config = loadConfig();

  // Initialize store
  const store = new ForestStore(config.dbPath);
  console.log(`SQLite database: ${config.dbPath}`);

  // Initialize services
  const wgKeys = new WireGuardKeyService(config);
  const nodeRegistry = new NodeRegistry(store, config);
  const bootstrapManager = new BootstrapManager(store, config);
  const meshCoordinator = new MeshCoordinator(store, config);
  const enrollmentService = new EnrollmentService(store, config, wgKeys, bootstrapManager);

  // Create HTTP server
  const app = createServer({
    nodeRegistry,
    enrollmentService,
    meshCoordinator,
    bootstrapManager,
    wgKeys,
  });

  // Start background tasks
  nodeRegistry.start();
  bootstrapManager.start();
  meshCoordinator.start();

  // Start HTTP server
  const server = serve({
    fetch: app.fetch,
    port: config.port,
    hostname: config.host,
  }, (info) => {
    console.log(`Forest CP listening on http://${config.host}:${info.port}`);
    console.log(`Public URL: ${config.publicUrl}`);
    console.log('');
    console.log('Endpoints:');
    console.log(`  GET  /api/v1/nodes          - List nodes`);
    console.log(`  POST /api/v1/nodes          - Register node`);
    console.log(`  POST /api/v1/enroll         - Create enrollment`);
    console.log(`  GET  /api/v1/enroll/:token   - Get enrollment config`);
    console.log(`  GET  /api/v1/mesh/topology   - Mesh topology`);
    console.log(`  GET  /api/v1/mesh/health     - Mesh health`);
    console.log(`  GET  /api/v1/bootstrap       - Bootstrap peers`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down Forest Control Plane...');
    nodeRegistry.stop();
    bootstrapManager.stop();
    meshCoordinator.stop();
    store.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Run when executed directly
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
