import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { config } from '../config.js';

const FAILURE_EXIT_CODE = 1;
// One connection is enough: migrations run one after the other.
const MIGRATION_POOL_SIZE = 1;

// The same relative path works from src/db (tsx) and from dist/db (Docker):
// both are two levels below apps/api, where the ./drizzle folder lives.
const migrationsFolder = fileURLToPath(
  new URL('../../drizzle', import.meta.url)
);

// Applies every migration that is not yet recorded in drizzle.__drizzle_migrations,
// in order, each inside the same transaction. Running it twice changes nothing.
// It uses drizzle-orm's migrator (not drizzle-kit) so it also works in the
// production image, which has no devDependencies.
const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: MIGRATION_POOL_SIZE,
});

try {
  await migrate(drizzle(pool), { migrationsFolder });
  process.stdout.write('Migrations applied.\n');
} catch (error) {
  process.stderr.write(`Migration failed: ${String(error)}\n`);
  process.exitCode = FAILURE_EXIT_CODE;
} finally {
  await pool.end();
}
