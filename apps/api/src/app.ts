import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './routes/health.js';
import { registerBearRoutes } from './routes/bears.js';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: true,
  });

  registerHealthRoutes(app);
  registerBearRoutes(app);
  return app;
}
