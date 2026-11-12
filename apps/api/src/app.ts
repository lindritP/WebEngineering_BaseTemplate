import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { InMemoryCommentStore } from './comments/commentStore.js';
import { generateRequestId, registerRequestIdHeader } from './requestId.js';
import { registerBearRoutes } from './routes/bears.js';
import { registerCommentRoutes } from './routes/comments.js';
import { registerHealthRoutes } from './routes/health.js';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: true,
    genReqId: generateRequestId,
  });

  const commentStore = new InMemoryCommentStore();

  // Before the routes, so every response carries the request id.
  registerRequestIdHeader(app);

  registerHealthRoutes(app);
  registerBearRoutes(app);
  registerCommentRoutes(app, commentStore);
  return app;
}
