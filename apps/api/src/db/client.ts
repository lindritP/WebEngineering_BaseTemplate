import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

export type Database = NodePgDatabase;

// Drizzle builds the SQL; the pool from pool.ts runs it, so every query
// borrows a pooled connection and returns it when the query is done.
export function createDatabase(pool: Pool): Database {
  return drizzle(pool);
}
