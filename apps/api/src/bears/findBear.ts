import { BearListSchema } from './bear.js';
import type { Bear } from './bear.js';
import { fetchBears } from './fetchBears.js';
import { NotFoundError, UpstreamError } from '../errors.js';

// Last check before the data leaves the server: whatever Wikipedia sent,
// the browser only ever gets bears that match the contract.
export async function loadBears(): Promise<Bear[]> {
  const result = BearListSchema.safeParse(await fetchBears());
  if (!result.success) {
    throw new UpstreamError('Wikipedia data does not match the bear contract', {
      cause: result.error,
    });
  }
  return result.data;
}

// Used by the bear routes and by the comment routes: an unknown id is a 404.
export async function findBear(id: string): Promise<Bear> {
  const bear = (await loadBears()).find((candidate) => candidate.id === id);
  if (bear === undefined) {
    throw new NotFoundError(`No bear with id "${id}"`);
  }
  return bear;
}
