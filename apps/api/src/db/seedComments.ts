import pg from 'pg';
import { config } from '../config.js';

// Fills the comments table with 100,000 rows so queries have something to
// chew on. Run: npm run db:seed-comments
// Safe to repeat: it removes its own rows (author "load-test") first.

const COMMENT_COUNT = 100_000;
const SINGLE_CONNECTION = 1;
const FAILURE_EXIT_CODE = 1;
const NONE = 0;
const LOAD_TEST_AUTHOR = 'load-test';

// One INSERT ... SELECT does all the work inside the database: generate_series
// makes the rows, the bears are dealt out round robin, and the creation times
// are random over two years. Random times matter: if they ascended with the
// insert order, the rows would already lie on disk in the order the queries
// want and hide the cost of sorting.
const INSERT_SQL = `
  with bear_ids as (select array_agg(id order by id) as ids from bears)
  insert into comments (bear_id, author, text, created_at)
  select
    ids[1 + (n % cardinality(ids))],
    $1,
    'Load test comment ' || n,
    now() - random() * interval '730 days'
  from bear_ids, generate_series(1, $2::int) as n
`;

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: SINGLE_CONNECTION,
});

try {
  const removed = await pool.query('delete from comments where author = $1', [
    LOAD_TEST_AUTHOR,
  ]);
  const inserted = await pool.query(INSERT_SQL, [
    LOAD_TEST_AUTHOR,
    COMMENT_COUNT,
  ]);
  // Fresh statistics: the planner decides by them (see explainComments.ts).
  await pool.query('analyze comments');
  process.stdout.write(
    `Removed ${removed.rowCount ?? NONE} old load-test comments, inserted ${inserted.rowCount ?? NONE}.\n`
  );
} catch (error) {
  process.stderr.write(
    `Seeding the comments failed: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = FAILURE_EXIT_CODE;
} finally {
  await pool.end();
}
