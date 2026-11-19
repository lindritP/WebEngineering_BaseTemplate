import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// The slug is the natural key: the bears come from Wikipedia and their slug
// (from the binomial name) is stable and already used in every URL.
export const bears = pgTable('bears', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  binomial: text('binomial').notNull(),
  // Not every species has a picture on Wikipedia.
  imageUrl: text('image_url'),
  range: text('range').notNull(),
  // When the row was last refreshed from Wikipedia (the seed sets it).
  fetchedAt: timestamp('fetched_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Comments get a surrogate key (uuid): they have no natural identifier, and
// the server generates it, so a client can never guess the next id.
export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Deleting a bear removes its comments with it: a comment without its bear
    // would be an orphan nobody can reach.
    bearId: text('bear_id')
      .notNull()
      .references(() => bears.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    text: text('text').notNull(),
    // timestamptz: stored as an absolute instant, independent of the session's
    // time zone setting.
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Postgres indexes primary keys automatically but NOT foreign keys. Every
    // "comments of one bear" query and every cascade delete looks rows up by
    // bear_id, so without this index each of them reads the whole table.
    index('comments_bear_id_idx').on(table.bearId),
  ]
);

export type BearRow = typeof bears.$inferSelect;
export type CommentRow = typeof comments.$inferSelect;
