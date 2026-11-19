import { randomUUID } from 'node:crypto';
import type { Comment, CreateComment } from './comment.js';
import type {
  CommentPage,
  CommentRepository,
  PageRequest,
} from './commentRepository.js';

const FROM_START = 0;
const ONE_MS = 1;
const NO_REPORTS = 0;
const EPOCH = 0;
const LAST = -1;
const SAME = 0;

// Newest first; id breaks ties. Negative: a sorts before b.
function compareNewestFirst(
  a: { createdAt: string; id: string },
  b: { createdAt: string; id: string }
): number {
  const byTime = Date.parse(b.createdAt) - Date.parse(a.createdAt);
  if (byTime !== SAME) {
    return byTime;
  }
  return b.id.localeCompare(a.id);
}

// For tests: the same contract as the database version, without a database.
export class InMemoryCommentRepository implements CommentRepository {
  // Keyed by comment id, because delete() knows only the comment id. A Map
  // keeps insertion order, so lists come out oldest first, like ORDER BY
  // created_at in the database version.
  private readonly comments = new Map<string, Comment>();
  // Every comment gets a creation time later than the one before, so "newest
  // first" is deterministic even when two comments arrive in one millisecond
  // (PostgreSQL's microseconds make that practically impossible there).
  private lastCreatedAt = EPOCH;

  // Nothing here waits for anything: the methods are async only so that they
  // have the same signature as the database version.
  async listByBear(bearId: string): Promise<Comment[]> {
    return await Promise.resolve(
      this.visible().filter((comment) => comment.bearId === bearId)
    );
  }

  async pageByBear(
    bearId: string,
    { limit, after }: PageRequest
  ): Promise<CommentPage> {
    const newestFirst = this.visible()
      .filter((comment) => comment.bearId === bearId)
      .sort((a, b) => compareNewestFirst(a, b));
    // Everything that sorts after the cursor position.
    const rest =
      after === undefined
        ? newestFirst
        : newestFirst.filter(
            (comment) => compareNewestFirst(comment, after) > SAME
          );
    const items = rest.slice(FROM_START, limit);
    const [lastItem] = items.slice(LAST);
    const hasMore = rest.length > limit;
    return await Promise.resolve({
      items,
      nextCursor:
        hasMore && lastItem !== undefined
          ? { createdAt: lastItem.createdAt, id: lastItem.id }
          : undefined,
    });
  }

  async listByBears(
    bearIds: readonly string[]
  ): Promise<Map<string, Comment[]>> {
    const result = new Map<string, Comment[]>(
      bearIds.map((bearId) => [bearId, []])
    );
    for (const comment of this.visible()) {
      result.get(comment.bearId)?.push(comment);
    }
    return await Promise.resolve(result);
  }

  async add(bearId: string, input: CreateComment): Promise<Comment> {
    const comment: Comment = {
      id: randomUUID(),
      bearId,
      author: input.author,
      text: input.text,
      createdAt: this.nextTimestamp(),
      reportCount: NO_REPORTS,
      hiddenAt: null,
    };
    this.comments.set(comment.id, comment);
    return await Promise.resolve(comment);
  }

  // Comments hidden after too many reports are not listed.
  private visible(): Comment[] {
    return [...this.comments.values()].filter(
      (comment) => comment.hiddenAt === null
    );
  }

  private nextTimestamp(): string {
    this.lastCreatedAt = Math.max(Date.now(), this.lastCreatedAt + ONE_MS);
    return new Date(this.lastCreatedAt).toISOString();
  }

  async delete(id: string): Promise<boolean> {
    return await Promise.resolve(this.comments.delete(id));
  }
}
