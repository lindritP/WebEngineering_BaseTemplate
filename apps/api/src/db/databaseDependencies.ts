import type { FastifyBaseLogger } from 'fastify';
import { DrizzleBearRepository } from '../bears/drizzleBearRepository.js';
import { DrizzleCommentRepository } from '../comments/drizzleCommentRepository.js';
import type { AppDependencies } from '../dependencies.js';
import { createDatabase } from './client.js';
import { DrizzleTransactionRunner } from './drizzleTransactionRunner.js';
import { createPool } from './pool.js';

// The production wiring: one pool, one Drizzle client, repositories on top.
export function createDatabaseDependencies(
  logger: FastifyBaseLogger
): AppDependencies {
  const pool = createPool(logger);
  const db = createDatabase(pool);

  return {
    bears: new DrizzleBearRepository(db),
    comments: new DrizzleCommentRepository(db),
    transactions: new DrizzleTransactionRunner(db),
    // A trivial query proves a free connection, the network and a database
    // that answers.
    checkReady: async () => {
      await pool.query('select 1');
    },
    close: async () => {
      await pool.end();
    },
  };
}
