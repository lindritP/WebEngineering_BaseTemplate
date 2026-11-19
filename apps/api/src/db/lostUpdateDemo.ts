import pg from 'pg';
import { DrizzleBearRepository } from '../bears/drizzleBearRepository.js';
import { DrizzleCommentRepository } from '../comments/drizzleCommentRepository.js';
import { ReportService } from '../comments/reportService.js';
import { config } from '../config.js';
import { createDatabase } from './client.js';
import { DrizzleTransactionRunner } from './drizzleTransactionRunner.js';

// Sends 50 reports for ONE comment at the same time, once with the naive
// read-modify-write and once with the transaction and row lock, and prints
// the final report_count. Run: npm run demo:lost-update

const CONCURRENT_REPORTS = 50;
const RUNS = 3;
const FIRST = 0;
const FIRST_RUN = 1;
const NEXT = 1;
const FAILURE_EXIT_CODE = 1;

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: config.dbPoolMax,
});
const db = createDatabase(pool);
const comments = new DrizzleCommentRepository(db);
const service = new ReportService(comments, new DrizzleTransactionRunner(db));

async function fireConcurrently(
  report: (commentId: string) => Promise<unknown>,
  commentId: string
): Promise<void> {
  await Promise.all(
    Array.from({ length: CONCURRENT_REPORTS }, async () => {
      await report(commentId);
    })
  );
}

try {
  const [bear] = await new DrizzleBearRepository(db).list();
  if (bear === undefined) {
    throw new Error('No bears found. Run npm run db:seed first.');
  }
  const { id } = await comments.add(bear.id, {
    author: 'lost-update-demo',
    text: 'The comment that gets reported 50 times',
  });

  const countAfter = async (
    report: (commentId: string) => Promise<unknown>
  ): Promise<number> => {
    // Back to a clean state, then 50 reports at once.
    await comments.saveReportState(id, { reportCount: FIRST, hiddenAt: null });
    await fireConcurrently(report, id);
    return (await comments.findById(id))?.reportCount ?? FIRST;
  };

  process.stdout.write(
    `${CONCURRENT_REPORTS} concurrent reports for one comment, pool of ${config.dbPoolMax} connections\n\n`
  );
  for (let run = FIRST_RUN; run <= RUNS; run += NEXT) {
    // eslint-disable-next-line no-await-in-loop -- the runs must not overlap: each one measures its own 50 reports
    const count = await countAfter(async (commentId) => {
      await service.reportNaively(commentId);
    });
    process.stdout.write(
      `naive (read, +1 in TypeScript, write), run ${run}: report_count = ${count}  (expected ${CONCURRENT_REPORTS})\n`
    );
  }
  for (let run = FIRST_RUN; run <= RUNS; run += NEXT) {
    // eslint-disable-next-line no-await-in-loop -- the runs must not overlap: each one measures its own 50 reports
    const count = await countAfter(async (commentId) => {
      await service.report(commentId);
    });
    process.stdout.write(
      `transaction + FOR UPDATE, run ${run}:                report_count = ${count}  (expected ${CONCURRENT_REPORTS})\n`
    );
  }

  await comments.delete(id);
} catch (error) {
  process.stderr.write(
    `The demo failed: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = FAILURE_EXIT_CODE;
} finally {
  await pool.end();
}
