import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { OK } from '../httpStatus.js';
import { API_VERSION } from '../version.js';

const HealthSchema = z
  .object({
    status: z.string().describe('Always "ok" while the process can answer'),
    version: z.string(),
    uptime: z.number().describe('Seconds since the API process started'),
  })
  .meta({ id: 'Health' });

export function registerHealthRoutes(app: FastifyInstance): void {
  app.withTypeProvider<ZodTypeProvider>().get(
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
}
