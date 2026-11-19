import { drizzle } from 'drizzle-orm/node-postgres';
import type {
  NodePgDatabase,
  NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import type { Pool } from 'pg';

export type Database = NodePgDatabase;

// Anything that can run queries: the database (pool) AND a transaction on one
// connection. Repositories take this, so the same class works in both.
export type Queryable = PgDatabase<NodePgQueryResultHKT>;

// Drizzle builds the SQL; the pool from pool.ts runs it, so every query
// borrows a pooled connection and returns it when the query is done.
export function createDatabase(pool: Pool): Database {
  return drizzle(pool);
}
