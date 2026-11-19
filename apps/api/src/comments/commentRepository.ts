import type { Comment, CreateComment } from './comment.js';

export interface CommentRepository {
  // The comments of one bear, oldest first.
  listByBear: (bearId: string) => Promise<Comment[]>;
  // The comments of many bears with ONE round trip. Every requested id is in
  // the result, with an empty array if the bear has no comments. This is the
  // answer to the N+1 problem: callers never loop over listByBear.
  listByBears: (bearIds: readonly string[]) => Promise<Map<string, Comment[]>>;
  // The repository assigns id and createdAt.
  add: (bearId: string, input: CreateComment) => Promise<Comment>;
  // false if there was no such comment.
  delete: (id: string) => Promise<boolean>;
}
