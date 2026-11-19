import pg from 'pg';
import { config } from '../config.js';

// Measures the comments query of GET /api/bears/:id/comments without and with
// the composite index, using EXPLAIN ANALYZE. Run: npm run db:explain
// (after npm run db:seed-comments). Everything happens in a transaction that
// is rolled back, so the database ends up exactly as it was.

const SINGLE_CONNECTION = 1;
const FAILURE_EXIT_CODE = 1;
const PAGE_SIZE = 20;
const ONE_MORE = 1;
const PAGE_SIZE_PLUS_ONE = PAGE_SIZE + ONE_MORE;
const DEEP_OFFSET = 5000;
const FIRST_ROW = 0;
const NONE = 0;

const INDEXES = ['comments_bear_id_idx', 'comments_bear_created_id_idx'];

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: SINGLE_CONNECTION,
});

async function explain(client: pg.PoolClient, sql: string): Promise<string> {
  const explainSql = `explain (analyze, buffers) ${sql}`;
  // The first run warms the cache, the second one is the one reported.
  await client.query(explainSql);
  const result = await client.query<Record<'QUERY PLAN', string>>(explainSql);
  return result.rows.map((row) => row['QUERY PLAN']).join('\n');
}

try {
  const client = await pool.connect();
  try {
    await client.query('begin');

    const {
      rows: [bear],
    } = await client.query<{ bear_id: string }>(
      `select bear_id from comments group by bear_id order by count(*) desc, bear_id limit 1`
    );
    if (bear === undefined) {
      throw new Error('No comments found. Run npm run db:seed-comments first.');
    }
    const { bear_id: bearName } = bear;
    const bearId = client.escapeLiteral(bearName);
    const total = await client.query<{ count: string }>(
      `select count(*) from comments where bear_id = ${bearId}`
    );

    // A cursor in the middle of the bear's comments: "deep" in the list.
    const {
      rows: [position],
    } = await client.query<{ created_at: string; id: string }>(
      `select created_at::text, id from comments where bear_id = ${bearId}
         order by created_at desc, id desc offset ${DEEP_OFFSET} limit 1`
    );
    if (position === undefined) {
      throw new Error('Not enough comments for one bear to measure.');
    }
    const { created_at: cursorTime, id: cursorId } = position;
    const cursor = `(created_at, id) < (${client.escapeLiteral(cursorTime)}::timestamptz, ${client.escapeLiteral(cursorId)}::uuid)`;

    const queries = {
      'First page (newest 20)': `select * from comments where bear_id = ${bearId}
        order by created_at desc, id desc limit ${PAGE_SIZE_PLUS_ONE}`,
      [`Deep page by cursor (after row ${DEEP_OFFSET})`]: `select * from comments
        where bear_id = ${bearId} and ${cursor}
        order by created_at desc, id desc limit ${PAGE_SIZE_PLUS_ONE}`,
      [`Deep page by OFFSET ${DEEP_OFFSET}`]: `select * from comments where bear_id = ${bearId}
        order by created_at desc, id desc limit ${PAGE_SIZE} offset ${DEEP_OFFSET}`,
    };

    const report = async (title: string): Promise<void> => {
      process.stdout.write(`\n######## ${title}\n`);
      for (const [name, sql] of Object.entries(queries)) {
        process.stdout.write(`\n--- ${name}\n`);
        // eslint-disable-next-line no-await-in-loop -- one connection, the queries must run one after another
        process.stdout.write(`${await explain(client, sql)}\n`);
      }
    };

    process.stdout.write(
      `Bear ${bearName}: ${total.rows[FIRST_ROW]?.count ?? NONE} of the comments.\n`
    );

    // Without any index on comments except the primary key.
    for (const index of INDEXES) {
      // eslint-disable-next-line no-await-in-loop -- DDL on one connection, in order
      await client.query(`drop index if exists ${index}`);
    }
    await report('WITHOUT an index on (bear_id, created_at, id)');

    await client.query(
      'create index comments_bear_created_id_idx on comments using btree (bear_id, created_at, id)'
    );
    await client.query('analyze comments');
    await report('WITH the index on (bear_id, created_at, id)');

    await client.query('rollback');
  } finally {
    client.release();
  }
} catch (error) {
  process.stderr.write(
    `Measuring failed: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = FAILURE_EXIT_CODE;
} finally {
  await pool.end();
}
