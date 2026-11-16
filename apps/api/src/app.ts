import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { InMemoryCommentStore } from './comments/commentStore.js';
import { config } from './config.js';
import { registerCors } from './cors.js';
import { registerProblemDetails } from './problemDetails.js';
import { generateRequestId, registerRequestIdHeader } from './requestId.js';
import { registerBearRoutes } from './routes/bears.js';
import { registerCommentRoutes } from './routes/comments.js';
import { registerDebugRoutes } from './routes/debug.js';
import { registerHealthRoutes } from './routes/health.js';

// Async because plugins such as CORS are registered with await: they must be
// in place before the routes are added.
export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: true,
    genReqId: generateRequestId,
  });

  const commentStore = new InMemoryCommentStore();

  // Before the routes, so they all share the request id, CORS headers and
  // the error format.
  await registerCors(app);
  registerRequestIdHeader(app);
  registerProblemDetails(app);

  registerHealthRoutes(app);
  registerBearRoutes(app);
  registerCommentRoutes(app, commentStore);
  if (config.enableDebugRoutes) {
    registerDebugRoutes(app);
  }
  // A Fastify instance is thenable: awaiting it waits until every plugin has
  // loaded (like app.ready()), so callers get a finished app.
  return await app;
}
