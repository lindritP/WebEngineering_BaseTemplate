import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { BearListSchema } from '../bears/bear.js';
import type { Bear } from '../bears/bear.js';
import { config } from '../config.js';
import { bears } from './schema.js';

const FAILURE_EXIT_CODE = 1;
const SEED_POOL_SIZE = 1;

// Same relative path from src/db (tsx) and dist/db (Docker image).
const fixturePath = fileURLToPath(
  new URL('../../seed/bears.json', import.meta.url)
);

// The fixture is a snapshot of GET /api/bears from Playground 4 (live
// Wikipedia data, already validated by the BFF code). Seeding from a file
// keeps the seed offline, fast and identical on every machine and in CI.
async function readFixture(): Promise<Bear[]> {
  const raw: unknown = JSON.parse(await readFile(fixturePath, 'utf8'));
  // Same contract as the API: a broken fixture fails here, not in the UI.
  return BearListSchema.parse(raw);
}

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: SEED_POOL_SIZE,
});

try {
  const rows = await readFixture();

  // Upsert: insert new bears, update existing ones (matched by the slug).
  // One statement, so it is all-or-nothing, and running it twice is harmless.
  // `excluded` is Postgres' name for "the row that was rejected by the
  // conflict", i.e. the new values from the fixture.
  await drizzle(pool)
    .insert(bears)
    .values(rows)
    .onConflictDoUpdate({
      target: bears.id,
      set: {
        name: sql`excluded.name`,
        binomial: sql`excluded.binomial`,
        imageUrl: sql`excluded.image_url`,
        range: sql`excluded.range`,
        fetchedAt: sql`now()`,
      },
    });

  process.stdout.write(`Seeded ${rows.length} bears.\n`);
} catch (error) {
  process.stderr.write(`Seeding failed: ${String(error)}\n`);
  process.exitCode = FAILURE_EXIT_CODE;
} finally {
  await pool.end();
}
