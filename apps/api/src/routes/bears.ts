import type { FastifyInstance } from 'fastify';
import { BearListSchema } from '../bears/bear.js';
import type { Bear } from '../bears/bear.js';
import { fetchBears } from '../bears/fetchBears.js';
import { NotFoundError, UpstreamError } from '../errors.js';

// Last check before the data leaves the server: whatever Wikipedia sent,
// the browser only ever gets bears that match the contract.
async function loadBears(): Promise<Bear[]> {
  const result = BearListSchema.safeParse(await fetchBears());
  if (!result.success) {
    throw new UpstreamError('Wikipedia data does not match the bear contract', {
      cause: result.error,
    });
  }
  return result.data;
}

export function registerBearRoutes(app: FastifyInstance): void {
  app.get('/api/bears', async () => await loadBears());

  app.get<{ Params: { id: string } }>(
    '/api/bears/:id',
    async ({ params: { id } }) => {
      const bear = (await loadBears()).find((candidate) => candidate.id === id);
      if (bear === undefined) {
        throw new NotFoundError(`No bear with id "${id}"`);
      }
      return bear;
    }
  );
}
