import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { Pool } from 'pg';
import { z } from 'zod';
import { ServiceUnavailableError } from '../errors.js';
import { OK, SERVICE_UNAVAILABLE } from '../httpStatus.js';
import { problemResponses } from '../problemDetails.js';
import { API_VERSION } from '../version.js';

const HealthSchema = z
  .object({
    status: z.string().describe('Always "ok" while the process can answer'),
    version: z.string(),
    uptime: z.number().describe('Seconds since the API process started'),
  })
  .meta({ id: 'Health' });

const ReadinessSchema = z
  .object({
    status: z.literal('ready'),
    database: z.literal('up'),
  })
  .meta({ id: 'Readiness' });

// A trivial query proves the whole path: a free pooled connection, the network
// and a database that answers. The pool's connection timeout keeps this from
// hanging when the database is unreachable.
async function checkDatabase(pool: Pool): Promise<void> {
  try {
    await pool.query('select 1');
  } catch (error) {
    throw new ServiceUnavailableError('Database check failed', {
      cause: error,
    });
  }
}

export function registerHealthRoutes(app: FastifyInstance, pool: Pool): void {
  const route = app.withTypeProvider<ZodTypeProvider>();

  // Liveness: "is the process running?" Never touches the database, so a
  // database outage does not make Docker restart a healthy API.
  route.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        summary: 'Liveness check for Docker and monitoring',
        response: { [OK]: HealthSchema },
      },
    },
    () => ({
      status: 'ok',
      version: API_VERSION,
      uptime: process.uptime(),
    })
  );

  // Readiness: "can it serve traffic right now?" A load balancer takes the
  // instance out of rotation on 503 and puts it back when this turns 200.
  route.get(
    '/health/ready',
    {
      schema: {
        tags: ['health'],
        summary: 'Readiness check: 200 only if the database answers',
        response: {
          [OK]: ReadinessSchema,
          ...problemResponses([SERVICE_UNAVAILABLE]),
        },
      },
    },
    async () => {
      await checkDatabase(pool);
      return { status: 'ready' as const, database: 'up' as const };
    }
  );
}
