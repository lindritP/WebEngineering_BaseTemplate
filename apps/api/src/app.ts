import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './routes/health.js';
import { registerBearRoutes } from './routes/bears.js';
import { InMemoryCommentStore } from './comments/commentStore.js';
import { registerCommentRoutes } from './routes/comments.js';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: true,
  });

  const commentStore = new InMemoryCommentStore();
  registerHealthRoutes(app);
  registerBearRoutes(app);
  registerCommentRoutes(app, commentStore);
  return app;
}
