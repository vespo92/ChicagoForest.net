/**
 * @chicago-forest/forest-control-plane - Enrollment API Routes
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { EnrollmentService } from '../services/enrollment';

const createEnrollmentSchema = z.object({
  nodeName: z.string().min(1),
  capabilities: z.array(z.string()).optional(),
  headscaleUser: z.string().optional(),
  validityHours: z.number().min(1).max(720).optional(),
});

export function createEnrollmentRoutes(enrollmentService: EnrollmentService): Hono {
  const app = new Hono();

  // Create an enrollment token
  app.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = createEnrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.format() }, 400);
    }

    try {
      const record = await enrollmentService.createEnrollment(parsed.data as any);
      return c.json({
        success: true,
        data: {
          token: record.token,
          nodeName: record.nodeName,
          expiresAt: record.expiresAt,
        },
        timestamp: new Date().toISOString(),
      }, 201);
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // Retrieve enrollment config bundle (called by routers on first boot)
  app.get('/:token', (c) => {
    const token = c.req.param('token');
    const bundle = enrollmentService.getConfigBundle(token);

    if (!bundle) {
      return c.json({
        success: false,
        error: 'Enrollment token not found, expired, or already claimed',
      }, 404);
    }

    return c.json({ success: true, data: bundle, timestamp: new Date().toISOString() });
  });

  // Claim an enrollment (called by the node after boot + Headscale registration)
  app.post('/:token/claim', async (c) => {
    const token = c.req.param('token');
    const body = await c.req.json();
    const nodeId = body?.nodeId;

    if (!nodeId || typeof nodeId !== 'string') {
      return c.json({ success: false, error: 'nodeId is required' }, 400);
    }

    const ok = enrollmentService.claimEnrollment(token, nodeId);
    if (!ok) {
      return c.json({
        success: false,
        error: 'Token not found, expired, or already claimed',
      }, 404);
    }

    return c.json({ success: true, timestamp: new Date().toISOString() });
  });

  // Revoke an enrollment token
  app.delete('/:token', (c) => {
    const ok = enrollmentService.revokeEnrollment(c.req.param('token'));
    if (!ok) {
      return c.json({ success: false, error: 'Token not found or not pending' }, 404);
    }
    return c.json({ success: true, timestamp: new Date().toISOString() });
  });

  // List enrollments
  app.get('/', (c) => {
    const status = c.req.query('status') as any;
    const records = enrollmentService.listEnrollments(status);
    return c.json({ success: true, data: records, timestamp: new Date().toISOString() });
  });

  return app;
}
