import type { FastifyInstance } from 'fastify';

// Only registered with ENABLE_DEBUG_ROUTES=true (see app.ts). It simulates a
// bug, so the 500 path of the error handler can be shown with curl. The
// message stands in for internals that must stay in the log.
export function registerDebugRoutes(app: FastifyInstance): void {
  app.get('/api/debug/error', () => {
    throw new Error('Provoked failure: internal details stay in the log');
  });
}
