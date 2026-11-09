import { randomUUID } from 'node:crypto';
import type { Comment, CreateComment } from './comment.js';

// Lives in the memory of the API process: comments survive a page reload,
// but not a restart of the API. Playground 5 replaces this with PostgreSQL.
export class InMemoryCommentStore {
  // Keyed by comment id, because DELETE /api/comments/:commentId knows only
  // the comment id, not the bear. A Map keeps insertion order, so a list is
  // automatically sorted from oldest to newest.
  private readonly comments = new Map<string, Comment>();

  list(bearId: string): Comment[] {
    return [...this.comments.values()].filter(
      (comment) => comment.bearId === bearId
    );
  }

  add(bearId: string, input: CreateComment): Comment {
    const comment: Comment = {
      id: randomUUID(),
      bearId,
      author: input.author,
      text: input.text,
      createdAt: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  delete(id: string): boolean {
    return this.comments.delete(id);
  }
}
