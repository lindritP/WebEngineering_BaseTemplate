import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { DrizzleBearRepository } from '../bears/drizzleBearRepository.js';
import { DrizzleCommentRepository } from '../comments/drizzleCommentRepository.js';
import { config } from '../config.js';

// Shows the N+1 problem with "comments for all bears" by counting the SQL
// statements the database actually receives. Run: npm run demo:n-plus-one

const SINGLE_CONNECTION = 1;
const NONE = 0;
const ONE_MORE = 1;

let queryCount = NONE;
const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: SINGLE_CONNECTION,
});
const db = drizzle(pool, {
  logger: {
    logQuery(): void {
      queryCount += ONE_MORE;
    },
  },
});
const bears = new DrizzleBearRepository(db);
const comments = new DrizzleCommentRepository(db);

try {
  const allBears = await bears.list();
  process.stdout.write(`Bears: ${allBears.length}\n\n`);

  // Naive: one query for the bears, then one more per bear.
  queryCount = NONE;
  await bears.list();
  for (const bear of allBears) {
    // eslint-disable-next-line no-await-in-loop -- the loop is the point of this demo: it is exactly the N+1 pattern
    await comments.listByBear(bear.id);
  }
  process.stdout.write(`N+1 (loop):   ${queryCount} queries\n`);

  // Batched: one query for the bears, one for all their comments.
  queryCount = NONE;
  const list = await bears.list();
  await comments.listByBears(list.map((bear) => bear.id));
  process.stdout.write(`listByBears:  ${queryCount} queries\n`);
} finally {
  await pool.end();
}
