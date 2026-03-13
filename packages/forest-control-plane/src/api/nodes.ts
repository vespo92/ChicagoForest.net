/**
 * @chicago-forest/forest-control-plane - Node API Routes
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { NodeRegistry } from '../services/node-registry';
import type { WireGuardKeyService } from '../services/wireguard-keys';
import type { ForestNodeStatus } from '../types';

const registerNodeSchema = z.object({
  nodeId: z.string().min(1),
  name: z.string().min(1),
  capabilities: z.array(z.string()).default([]),
  hardware: z.object({
    model: z.string(),
    cpu: z.string(),
    ramMb: z.number(),
    flashMb: z.number(),
    wirelessInterfaces: z.number(),
    ethernetPorts: z.number(),
    hasGps: z.boolean(),
  }),
  wgPublicKey: z.string().min(1),
  headscaleNodeId: z.string().optional(),
  ipAddresses: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  metadata: z.record(z.string()).optional(),
});

const heartbeatSchema = z.object({
  status: z.enum(['pending', 'active', 'degraded', 'offline', 'deregistered']),
  uptime: z.number(),
  load: z.number(),
  meshNeighbors: z.array(z.string()),
  linkQualities: z.record(z.number()).optional(),
  metadata: z.record(z.string()).optional(),
});

export function createNodeRoutes(
  registry: NodeRegistry,
  wgKeys: WireGuardKeyService,
): Hono {
  const app = new Hono();

  // List all nodes
  app.get('/', (c) => {
    const status = c.req.query('status') as ForestNodeStatus | undefined;
    const nodes = registry.listNodes(status);
    return c.json({ success: true, data: nodes, timestamp: new Date().toISOString() });
  });

  // Get single node
  app.get('/:nodeId', (c) => {
    const node = registry.getNode(c.req.param('nodeId'));
    if (!node) {
      return c.json({ success: false, error: 'Node not found' }, 404);
    }
    return c.json({ success: true, data: node, timestamp: new Date().toISOString() });
  });

  // Register a new node
  app.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = registerNodeSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.format() }, 400);
    }

    try {
      const node = registry.register(parsed.data as any);
      return c.json({ success: true, data: node, timestamp: new Date().toISOString() }, 201);
    } catch (err: any) {
      if (err.code === 'DUPLICATE_NODE') {
        return c.json({ success: false, error: err.message }, 409);
      }
      throw err;
    }
  });

  // Heartbeat
  app.post('/:nodeId/heartbeat', async (c) => {
    const body = await c.req.json();
    const parsed = heartbeatSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.format() }, 400);
    }

    const ok = registry.heartbeat(c.req.param('nodeId'), parsed.data as any);
    if (!ok) {
      return c.json({ success: false, error: 'Node not found or deregistered' }, 404);
    }
    return c.json({ success: true, timestamp: new Date().toISOString() });
  });

  // Deregister a node
  app.delete('/:nodeId', async (c) => {
    const nodeId = c.req.param('nodeId');
    const node = registry.getNode(nodeId);

    // Also remove from Headscale if we have the Headscale node ID
    if (node?.headscaleNodeId) {
      await wgKeys.deleteHeadscaleNode(node.headscaleNodeId);
    }

    const ok = registry.deregister(nodeId);
    if (!ok) {
      return c.json({ success: false, error: 'Node not found' }, 404);
    }
    return c.json({ success: true, timestamp: new Date().toISOString() });
  });

  return app;
}
