import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNull,
  sql,
} from 'drizzle-orm';
import type { Queryable } from '../db/client.js';
import { comments } from '../db/schema.js';
import type { CommentRow } from '../db/schema.js';
import type { Comment, CreateComment } from './comment.js';
import type {
  CommentPage,
  CommentRepository,
  PageRequest,
  ReportState,
} from './commentRepository.js';

const ONE_MORE = 1;
const FROM_START = 0;
const LAST = -1;

// The database stores timestamps, the API contract is ISO strings.
function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    bearId: row.bearId,
    author: row.author,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
    reportCount: row.reportCount,
    hiddenAt: row.hiddenAt?.toISOString() ?? null,
  };
}

// created_at with the full microseconds PostgreSQL stores, as an ISO string.
// Reading the column as a JavaScript Date would cut it to milliseconds, and a
// cursor built from that would skip rows that share the millisecond.
const createdAtExact = sql<string>`to_char(${comments.createdAt} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

export class DrizzleCommentRepository implements CommentRepository {
  constructor(private readonly db: Queryable) {}

  async listByBear(bearId: string): Promise<Comment[]> {
    const rows = await this.db
      .select()
      .from(comments)
      .where(and(eq(comments.bearId, bearId), isNull(comments.hiddenAt)))
      // id breaks ties between comments created in the same instant.
      .orderBy(asc(comments.createdAt), asc(comments.id));
    return rows.map(toComment);
  }

  // Keyset pagination: "the rows after this position" is a condition on the
  // sort key, so with an index on (bear_id, created_at, id) PostgreSQL jumps
  // straight to that position. OFFSET would read and throw away every row
  // before it.
  async pageByBear(
    bearId: string,
    { limit, after }: PageRequest
  ): Promise<CommentPage> {
    const rows = await this.db
      .select({ ...getTableColumns(comments), cursorCreatedAt: createdAtExact })
      .from(comments)
      .where(
        and(
          eq(comments.bearId, bearId),
          // Reported-away comments are not part of the list.
          isNull(comments.hiddenAt),
          // A row comparison: (created_at, id) < (x, y) means "created earlier,
          // or at the same instant with a smaller id".
          after === undefined
            ? undefined
            : sql`(${comments.createdAt}, ${comments.id}) < (${after.createdAt}::timestamptz, ${after.id}::uuid)`
        )
      )
      .orderBy(desc(comments.createdAt), desc(comments.id))
      // One more than asked for: its existence is the "has a next page" answer.
      .limit(limit + ONE_MORE);

    const pageRows = rows.slice(FROM_START, limit);
    const last = pageRows.at(LAST);
    return {
      items: pageRows.map(toComment),
      nextCursor:
        rows.length > limit && last !== undefined
          ? { createdAt: last.cursorCreatedAt, id: last.id }
          : undefined,
    };
  }

  // One query with IN (...) instead of one query per bear (N+1).
  async listByBears(
    bearIds: readonly string[]
  ): Promise<Map<string, Comment[]>> {
    const result = new Map<string, Comment[]>(
      bearIds.map((bearId) => [bearId, []])
    );
    const [firstId] = bearIds;
    if (firstId === undefined) {
      return result;
    }

    const rows = await this.db
      .select()
      .from(comments)
      .where(
        and(inArray(comments.bearId, [...bearIds]), isNull(comments.hiddenAt))
      )
      .orderBy(asc(comments.createdAt), asc(comments.id));
    for (const row of rows) {
      result.get(row.bearId)?.push(toComment(row));
    }
    return result;
  }

  async add(bearId: string, input: CreateComment): Promise<Comment> {
    // id and created_at come from the column defaults.
    const [row] = await this.db
      .insert(comments)
      .values({ bearId, author: input.author, text: input.text })
      .returning();
    if (row === undefined) {
      throw new Error('INSERT ... RETURNING returned no row');
    }
    return toComment(row);
  }

  async findById(id: string): Promise<Comment | undefined> {
    const [row] = await this.db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(ONE_MORE);
    return row === undefined ? undefined : toComment(row);
  }

  async findByIdForUpdate(id: string): Promise<Comment | undefined> {
    const [row] = await this.db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(ONE_MORE)
      // SELECT ... FOR UPDATE: the row stays locked until the surrounding
      // transaction ends.
      .for('update');
    return row === undefined ? undefined : toComment(row);
  }

  async saveReportState(
    id: string,
    state: ReportState
  ): Promise<Comment | undefined> {
    const [row] = await this.db
      .update(comments)
      .set({
        reportCount: state.reportCount,
        hiddenAt: state.hiddenAt === null ? null : new Date(state.hiddenAt),
      })
      .where(eq(comments.id, id))
      .returning();
    return row === undefined ? undefined : toComment(row);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });
    const [removed] = deleted;
    return removed !== undefined;
  }
}
