import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './routes/health.js';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: true,
  });

  registerHealthRoutes(app);
  return app;
}
