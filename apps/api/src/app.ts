import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { config } from './config.js';
import { registerCors } from './cors.js';
import { createDatabaseDependencies } from './db/databaseDependencies.js';
import type { AppDependencies } from './dependencies.js';
import { registerOpenApi } from './openapi.js';
import { registerProblemDetails } from './problemDetails.js';
import { generateRequestId, registerRequestIdHeader } from './requestId.js';
import { registerBearRoutes } from './routes/bears.js';
import { registerCommentRoutes } from './routes/comments.js';
import { registerDebugRoutes } from './routes/debug.js';
import { registerHealthRoutes } from './routes/health.js';

// Async because plugins such as CORS are registered with await: they must be
// in place before the routes are added.
// Without arguments the app talks to PostgreSQL; tests pass their own
// (in-memory) dependencies.
export async function buildApp(
  dependencies?: AppDependencies,
  { logger = true }: { logger?: boolean } = {}
): Promise<FastifyInstance> {
  const app = fastify({
    logger,
    genReqId: generateRequestId,
  });

  // Route schemas are zod schemas: they validate requests and responses and
  // are the source of the OpenAPI document.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // app.close() (tests, a graceful shutdown) runs the onClose hooks: the
  // production dependencies use it to end the connection pool.
  const deps = dependencies ?? createDatabaseDependencies(app.log);
  const { close } = deps;
  if (close !== undefined) {
    app.addHook('onClose', async () => {
      await close();
    });
  }

  // Before the routes, so they all share the request id, CORS headers and
  // the error format.
  await registerCors(app);
  registerRequestIdHeader(app);
  registerProblemDetails(app);
  await registerOpenApi(app);

  registerHealthRoutes(app, deps.checkReady);
  registerBearRoutes(app, deps.bears);
  registerCommentRoutes(app, deps.comments, deps.bears);
  if (config.enableDebugRoutes) {
    registerDebugRoutes(app);
  }
  // A Fastify instance is thenable: awaiting it waits until every plugin has
  // loaded (like app.ready()), so callers get a finished app.
  return await app;
}
