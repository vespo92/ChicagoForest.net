/**
 * @chicago-forest/forest-control-plane - Bootstrap API Routes
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { BootstrapManager } from '../services/bootstrap-manager';

const addBootstrapPeerSchema = z.object({
  nodeId: z.string().min(1),
  addresses: z.array(z.object({
    protocol: z.enum(['tcp', 'udp', 'ws', 'wss', 'quic', 'forest']),
    host: z.string().min(1),
    port: z.number().min(1).max(65535),
    path: z.string().optional(),
  })).min(1),
});

export function createBootstrapRoutes(bootstrapManager: BootstrapManager): Hono {
  const app = new Hono();

  // Get bootstrap peer list (for new nodes joining the mesh)
  app.get('/', (c) => {
    const peers = bootstrapManager.getBootstrapPeers(true);
    return c.json({ success: true, data: peers, timestamp: new Date().toISOString() });
  });

  // Add a bootstrap peer (operator action)
  app.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = addBootstrapPeerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.format() }, 400);
    }

    bootstrapManager.addPeer({
      nodeId: parsed.data.nodeId,
      addresses: parsed.data.addresses,
      lastHealthCheck: new Date().toISOString(),
      healthy: true,
    });

    return c.json({ success: true, timestamp: new Date().toISOString() }, 201);
  });

  // Remove a bootstrap peer
  app.delete('/:nodeId', (c) => {
    const ok = bootstrapManager.removePeer(c.req.param('nodeId'));
    if (!ok) {
      return c.json({ success: false, error: 'Bootstrap peer not found' }, 404);
    }
    return c.json({ success: true, timestamp: new Date().toISOString() });
  });

  return app;
}
