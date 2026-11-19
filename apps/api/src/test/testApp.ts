import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import type { Bear } from '../bears/bear.js';
import { InMemoryBearRepository } from '../bears/inMemoryBearRepository.js';
import { InMemoryCommentRepository } from '../comments/inMemoryCommentRepository.js';

export const testBears: Bear[] = [
  {
    id: 'u-arctos',
    name: 'Brown bear',
    binomial: 'U. arctos',
    imageUrl: 'https://example.test/brown.jpg',
    range: 'Northern hemisphere',
  },
  {
    id: 'a-melanoleuca',
    name: 'Giant panda',
    binomial: 'A. melanoleuca',
    imageUrl: null,
    range: 'Central China',
  },
];

// Ready without checking anything.
async function alwaysReady(): Promise<void> {
  await Promise.resolve();
}

interface TestAppOptions {
  // Replace the readiness check, e.g. with one that rejects.
  checkReady?: () => Promise<void>;
}

// The real app with in-memory repositories: no database, no network.
export async function buildTestApp(
  options: TestAppOptions = {}
): Promise<FastifyInstance> {
  return await buildApp(
    {
      bears: new InMemoryBearRepository(testBears),
      comments: new InMemoryCommentRepository(),
      checkReady: options.checkReady ?? alwaysReady,
    },
    { logger: false }
  );
}
