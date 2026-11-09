import type { FastifyInstance } from 'fastify';
import { findBear, loadBears } from '../bears/findBear.js';

export function registerBearRoutes(app: FastifyInstance): void {
  app.get('/api/bears', async () => await loadBears());

  app.get<{ Params: { id: string } }>(
    '/api/bears/:id',
    async ({ params: { id } }) => await findBear(id)
  );
}
