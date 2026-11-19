import { asc, eq, inArray } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { comments } from '../db/schema.js';
import type { CommentRow } from '../db/schema.js';
import type { Comment, CreateComment } from './comment.js';
import type { CommentRepository } from './commentRepository.js';

// The database stores a timestamp, the API contract is an ISO string.
function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    bearId: row.bearId,
    author: row.author,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DrizzleCommentRepository implements CommentRepository {
  constructor(private readonly db: Database) {}

  async listByBear(bearId: string): Promise<Comment[]> {
    const rows = await this.db
      .select()
      .from(comments)
      .where(eq(comments.bearId, bearId))
      // id breaks ties between comments created in the same instant.
      .orderBy(asc(comments.createdAt), asc(comments.id));
    return rows.map(toComment);
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
      .where(inArray(comments.bearId, [...bearIds]))
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

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });
    const [removed] = deleted;
    return removed !== undefined;
  }
}
