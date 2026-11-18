import type { FastifyBaseLogger } from 'fastify';
import pg from 'pg';
import { config } from '../config.js';

// How long a request waits for a free connection before it fails. The pg
// default is 0 = wait forever, which hangs every request once the pool is busy.
const CONNECTION_TIMEOUT_MS = 2000;
// Connections nobody used for this long are closed again.
const IDLE_TIMEOUT_MS = 30_000;

// One pool per process. new Pool() opens no connection yet: they are created
// on demand, up to `max`; further queries wait in a queue.
export function createPool(logger: FastifyBaseLogger): pg.Pool {
  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    max: config.dbPoolMax,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: IDLE_TIMEOUT_MS,
  });

  // An idle connection can break (database restart, network). Without a
  // listener this 'error' event is unhandled and kills the whole process.
  pool.on('error', (error) => {
    logger.error({ err: error }, 'Unexpected error on an idle database client');
  });

  return pool;
}
