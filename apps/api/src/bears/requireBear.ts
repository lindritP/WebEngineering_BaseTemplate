import { NotFoundError } from '../errors.js';
import type { Bear } from './bear.js';
import type { BearRepository } from './bearRepository.js';

// The repository says "not found" with undefined; for an HTTP request an
// unknown bear is a 404. Used by the bear routes and by the comment routes.
export async function requireBear(
  bears: BearRepository,
  id: string
): Promise<Bear> {
  const bear = await bears.findById(id);
  if (bear === undefined) {
    throw new NotFoundError(`No bear with id "${id}"`);
  }
  return bear;
}
