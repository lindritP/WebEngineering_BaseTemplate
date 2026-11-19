import { asc, eq } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { bears } from '../db/schema.js';
import { NotFoundError } from '../errors.js';
import type { Bear } from './bear.js';

// The id is the primary key, so there is at most one row anyway; the limit
// just states the intent.
const ONE_ROW = 1;

// Only the columns of the Bear contract: fetched_at is bookkeeping and stays
// inside the database.
const bearColumns = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  imageUrl: bears.imageUrl,
  range: bears.range,
};

// ORDER BY: without it Postgres may return rows in any order.
export async function listBears(db: Database): Promise<Bear[]> {
  return await db.select(bearColumns).from(bears).orderBy(asc(bears.name));
}

// Used by the bear routes and by the comment routes: an unknown id is a 404.
export async function findBear(db: Database, id: string): Promise<Bear> {
  const [bear] = await db
    .select(bearColumns)
    .from(bears)
    .where(eq(bears.id, id))
    .limit(ONE_ROW);
  if (bear === undefined) {
    throw new NotFoundError(`No bear with id "${id}"`);
  }
  return bear;
}
