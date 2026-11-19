import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
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

// checkReady is injected (see dependencies.ts): in production it runs a trivial
// query through the connection pool, whose connection timeout keeps it from
// hanging when the database is unreachable. Whatever it rejects with becomes a
// 503; the cause only goes to the log.
async function assertReady(checkReady: () => Promise<void>): Promise<void> {
  try {
    await checkReady();
  } catch (error) {
    throw new ServiceUnavailableError('Readiness check failed', {
      cause: error,
    });
  }
}

export function registerHealthRoutes(
  app: FastifyInstance,
  checkReady: () => Promise<void>
): void {
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
      await assertReady(checkReady);
      return { status: 'ready' as const, database: 'up' as const };
    }
  );
}
