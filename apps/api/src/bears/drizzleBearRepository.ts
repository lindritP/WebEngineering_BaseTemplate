import { asc, eq } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { bears } from '../db/schema.js';
import type { Bear } from './bear.js';
import type { BearRepository } from './bearRepository.js';

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

export class DrizzleBearRepository implements BearRepository {
  constructor(private readonly db: Database) {}

  // ORDER BY: without it Postgres may return rows in any order.
  async list(): Promise<Bear[]> {
    return await this.db
      .select(bearColumns)
      .from(bears)
      .orderBy(asc(bears.name));
  }

  async findById(id: string): Promise<Bear | undefined> {
    const [bear] = await this.db
      .select(bearColumns)
      .from(bears)
      .where(eq(bears.id, id))
      .limit(ONE_ROW);
    return bear;
  }
}
