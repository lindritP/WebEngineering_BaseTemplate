# API: persistence notes (Playground 5)

How the numbers below were produced:

```bash
docker compose up -d db
npm run db:migrate -w @bears/api
npm run db:seed-comments -w @bears/api   # 100,000 comments, ~12,500 per bear
npm run db:explain -w @bears/api         # the plans below
```

`db:explain` runs inside a transaction that is rolled back: it drops the
comment indexes, measures, creates the composite index, measures again and
leaves the database as it found it. Each query runs twice (cache warm-up);
the second run is reported. Machine: local PostgreSQL 18 in Docker.

## Task 4: pagination, filtering and one measured index

### The API

- `GET /api/bears/:id/comments?limit=20&cursor=...` returns
  `{ "items": [...], "nextCursor": "..." | null }`, newest first. `limit` is
  1 to 100 (default 20). The cursor is an opaque token (base64url JSON of
  `createdAt` and `id` of the last comment); a made-up cursor is a 400.
- `GET /api/bears?q=panda` keeps the bears whose name contains the text,
  case-insensitively. `%` and `_` are searched literally.

The query behind a page:

```sql
select * from comments
where bear_id = $1 and (created_at, id) < ($2, $3)   -- only after page 1
order by created_at desc, id desc
limit 21;                                            -- one more than the page
```

The 21st row only answers "is there a next page?"; it is never returned.
`created_at` alone is not unique, so `id` breaks ties: `(created_at, id)` is
a unique position, which is what a cursor needs. PostgreSQL stores
microseconds but a JavaScript `Date` only milliseconds, so the repository
reads the timestamp as text with full precision; going through `Date` would
silently skip rows that share a millisecond.

Checked against the real database: walking all 12,500 comments of one bear in
pages of 100 gives 125 pages, 12,500 rows, 12,500 unique ids.

### The index

Migration `apps/api/drizzle/0001_comments_keyset_index.sql` replaces the
single-column index on `bear_id` by

```sql
CREATE INDEX "comments_bear_created_id_idx" ON "comments" USING btree ("bear_id","created_at","id");
```

The leftmost column `bear_id` still serves every "comments of one bear"
lookup and the cascade delete, so the old index became redundant.

### Measured: without the index

```text
--- First page (newest 20)
Limit  (cost=2818.87..2818.92 rows=21 width=68) (actual time=5.029..5.032 rows=21.00 loops=1)
  Buffers: shared hit=1235
  ->  Sort  (cost=2818.87..2849.82 rows=12383 width=68) (actual time=5.028..5.030 rows=21.00 loops=1)
        Sort Key: created_at DESC, id DESC
        Sort Method: top-N heapsort  Memory: 29kB
        Buffers: shared hit=1235
        ->  Seq Scan on comments  (cost=0.00..2485.00 rows=12383 width=68) (actual time=0.005..4.232 rows=12500.00 loops=1)
              Filter: (bear_id = 'a-melanoleuca'::text)
              Rows Removed by Filter: 87500
              Buffers: shared hit=1235
Planning Time: 0.044 ms
Execution Time: 5.058 ms

--- Deep page by cursor (after row 5000)
Limit  (cost=3185.41..3185.46 rows=21 width=68) (actual time=5.079..5.081 rows=21.00 loops=1)
  Buffers: shared hit=1235
  ->  Sort  (cost=3185.41..3203.99 rows=7433 width=68) (actual time=5.078..5.079 rows=21.00 loops=1)
        Sort Key: created_at DESC, id DESC
        Sort Method: top-N heapsort  Memory: 30kB
        Buffers: shared hit=1235
        ->  Seq Scan on comments  (cost=0.00..2985.00 rows=7433 width=68) (actual time=0.009..4.620 rows=7499.00 loops=1)
              Filter: ((bear_id = 'a-melanoleuca'::text) AND (ROW(created_at, id) < ROW('2026-01-31 18:09:39.938229+00'::timestamp with time zone, '01c79a6d-66c6-4857-8615-7cc26870e5ed'::uuid)))
              Rows Removed by Filter: 92501
              Buffers: shared hit=1235
Planning Time: 0.041 ms
Execution Time: 5.098 ms

--- Deep page by OFFSET 5000
Limit  (cost=3320.57..3320.62 rows=20 width=68) (actual time=6.230..6.232 rows=20.00 loops=1)
  Buffers: shared hit=1235
  ->  Sort  (cost=3308.07..3339.02 rows=12383 width=68) (actual time=5.918..6.128 rows=5020.00 loops=1)
        Sort Key: created_at DESC, id DESC
        Sort Method: top-N heapsort  Memory: 1515kB
        Buffers: shared hit=1235
        ->  Seq Scan on comments  (cost=0.00..2485.00 rows=12383 width=68) (actual time=0.009..3.898 rows=12500.00 loops=1)
              Filter: (bear_id = 'a-melanoleuca'::text)
              Rows Removed by Filter: 87500
              Buffers: shared hit=1235
Planning Time: 0.051 ms
Execution Time: 6.292 ms
```

### Measured: with the index

```text
--- First page (newest 20)
Limit  (cost=0.42..9.65 rows=21 width=68) (actual time=0.005..0.011 rows=21.00 loops=1)
  Buffers: shared hit=24
  ->  Index Scan Backward using comments_bear_created_id_idx on comments  (cost=0.42..5471.27 rows=12443 width=68) (actual time=0.005..0.010 rows=21.00 loops=1)
        Index Cond: (bear_id = 'a-melanoleuca'::text)
        Index Searches: 1
        Buffers: shared hit=24
Planning Time: 0.015 ms
Execution Time: 0.016 ms

--- Deep page by cursor (after row 5000)
Limit  (cost=0.42..15.20 rows=21 width=68) (actual time=0.009..0.014 rows=21.00 loops=1)
  Buffers: shared hit=23
  ->  Index Scan Backward using comments_bear_created_id_idx on comments  (cost=0.42..5258.30 rows=7469 width=68) (actual time=0.008..0.013 rows=21.00 loops=1)
        Index Cond: ((bear_id = 'a-melanoleuca'::text) AND (ROW(created_at, id) < ROW('2026-01-31 18:09:39.938229+00'::timestamp with time zone, '01c79a6d-66c6-4857-8615-7cc26870e5ed'::uuid)))
        Index Searches: 1
        Buffers: shared hit=23
Planning Time: 0.022 ms
Execution Time: 0.021 ms

--- Deep page by OFFSET 5000
Limit  (cost=2198.78..2207.57 rows=20 width=68) (actual time=0.812..0.815 rows=20.00 loops=1)
  Buffers: shared hit=5056
  ->  Index Scan Backward using comments_bear_created_id_idx on comments  (cost=0.42..5471.27 rows=12443 width=68) (actual time=0.005..0.721 rows=5020.00 loops=1)
        Index Cond: (bear_id = 'a-melanoleuca'::text)
        Index Searches: 1
        Buffers: shared hit=5056
Planning Time: 0.015 ms
Execution Time: 0.820 ms
```

### Result

| Query (12,500 of 100,000 rows belong to the bear) | Without index                                 | With index                                           |
| ------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| First page                                        | 5.058 ms, Seq Scan + top-N sort, 1235 buffers | 0.016 ms, Index Scan Backward, 24 buffers            |
| Deep page by cursor                               | 5.098 ms, Seq Scan + top-N sort, 1235 buffers | 0.021 ms, Index Scan Backward, 23 buffers            |
| Deep page by `OFFSET 5000`                        | 6.292 ms, Seq Scan + sort, 1235 buffers       | 0.820 ms, 5,056 buffers (reads and drops 5,000 rows) |

- Without the index PostgreSQL reads the whole table (`Rows Removed by
Filter: 87500`) and sorts what is left, for every page.
- With it, the rows come out of the index already in the requested order, so
  there is no sort node, and `LIMIT 21` stops after 21 index entries.
- The cursor condition is part of the `Index Cond`: PostgreSQL jumps straight
  to the position. `OFFSET 5000` still walks 5,000 entries and throws them
  away, so it gets slower the deeper the page is; the cursor page costs the
  same everywhere.

## Task 5: transactions and the lost update

### The feature

`POST /api/comments/:commentId/report` adds one to `comments.report_count`
and returns the comment. The third report sets `hidden_at`; hidden comments
are no longer listed (but can still be found by id and reported again, the
count keeps going). Migration: `0002_comment_reports.sql`.

### The race, reproduced

`ReportService.reportNaively` reads the comment, adds one in TypeScript and
writes the result back:

```text
request A: SELECT report_count  -> 7
request B: SELECT report_count  -> 7      (A has not written yet)
request A: UPDATE ... SET report_count = 8
request B: UPDATE ... SET report_count = 8   (one report is lost)
```

`npm run demo:lost-update -w @bears/api` sends 50 concurrent reports for one
comment (pool of 10 connections), three times per version:

```text
50 concurrent reports for one comment, pool of 10 connections

naive (read, +1 in TypeScript, write), run 1: report_count = 1  (expected 50)
naive (read, +1 in TypeScript, write), run 2: report_count = 1  (expected 50)
naive (read, +1 in TypeScript, write), run 3: report_count = 1  (expected 50)
transaction + FOR UPDATE, run 1:                report_count = 50  (expected 50)
transaction + FOR UPDATE, run 2:                report_count = 50  (expected 50)
transaction + FOR UPDATE, run 3:                report_count = 50  (expected 50)
```

The naive result is 1, not "somewhere below 50": all 50 `SELECT`s are queued
in the pool before the first `UPDATE` is, so every request read 0 and wrote

1. With fewer requests or a slower network the result varies between 1 and
   50; it is never reliably 50.

### The fix

`ReportService.report` runs the read and the write as ONE transaction and the
read locks the row:

```ts
await this.transactions.run(async ({ comments }) => {
  const current = await comments.findByIdForUpdate(commentId); // SELECT ... FOR UPDATE
  if (current === undefined) return undefined;
  return await comments.saveReportState(
    commentId,
    nextReportState(current, new Date())
  );
});
```

A second report for the same comment waits at its `SELECT ... FOR UPDATE` until
the first transaction has committed, then reads the NEW count. Reports for
other comments do not wait. Checked over HTTP as well: 50 parallel
`curl -X POST .../report` ended with `report_count = 50` and `hidden_at` set.

Where the boundary lives: **in the service**. `TransactionRunner.run()` (see
`src/transactions.ts`) opens the transaction and hands the work repositories
that are bound to its connection. The repository methods (`findByIdForUpdate`,
`saveReportState`) are plain reads and writes; only the service knows that
they belong together. Tests use `InMemoryTransactionRunner`, which runs
transactions one after another; the unit tests reproduce the same race
(`reportService.test.ts`: naive < 50, transactional = 50) without a database.

The alternative that needs no explicit transaction is one atomic statement:

```sql
UPDATE comments
SET report_count = report_count + 1,
    hidden_at = CASE WHEN report_count + 1 >= 3 THEN coalesce(hidden_at, now()) ELSE hidden_at END
WHERE id = $1
RETURNING *;
```

The database reads and writes in a single step, so there is nothing to
interleave. It would work here too. I chose the row lock because the rule
stays readable in TypeScript (`nextReportState`, unit-testable without SQL)
and because it shows where a transaction boundary belongs. The price: two
round trips and a lock held for their duration, where the atomic statement
needs one round trip.
