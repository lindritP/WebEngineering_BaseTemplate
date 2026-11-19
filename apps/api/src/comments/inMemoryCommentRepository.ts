import { randomUUID } from 'node:crypto';
import type { Comment, CreateComment } from './comment.js';
import type { CommentRepository } from './commentRepository.js';

// For tests: the same contract as the database version, without a database.
export class InMemoryCommentRepository implements CommentRepository {
  // Keyed by comment id, because delete() knows only the comment id. A Map
  // keeps insertion order, so lists come out oldest first, like ORDER BY
  // created_at in the database version.
  private readonly comments = new Map<string, Comment>();

  // Nothing here waits for anything: the methods are async only so that they
  // have the same signature as the database version.
  async listByBear(bearId: string): Promise<Comment[]> {
    return await Promise.resolve(
      [...this.comments.values()].filter((comment) => comment.bearId === bearId)
    );
  }

  async listByBears(
    bearIds: readonly string[]
  ): Promise<Map<string, Comment[]>> {
    const result = new Map<string, Comment[]>(
      bearIds.map((bearId) => [bearId, []])
    );
    for (const comment of this.comments.values()) {
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
      createdAt: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    return await Promise.resolve(comment);
  }

  async delete(id: string): Promise<boolean> {
    return await Promise.resolve(this.comments.delete(id));
  }
}
