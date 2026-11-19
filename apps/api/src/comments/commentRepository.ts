import type { Comment, CreateComment } from './comment.js';
import type { CommentCursor } from './cursor.js';

export interface PageRequest {
  limit: number;
  // Continue after this position; without it the page starts at the newest.
  after?: CommentCursor;
}

export interface CommentPage {
  items: Comment[];
  // Where to continue, or undefined when this was the last page.
  nextCursor: CommentCursor | undefined;
}

export interface CommentRepository {
  // ALL comments of one bear, oldest first. Fine for a handful, wrong for
  // thousands: the API uses pageByBear.
  listByBear: (bearId: string) => Promise<Comment[]>;
  // One page of the comments of a bear, NEWEST first (keyset pagination on
  // (createdAt, id)). Asks the store for limit + 1 rows to learn whether
  // another page exists, so nextCursor is never a link to an empty page.
  pageByBear: (bearId: string, request: PageRequest) => Promise<CommentPage>;
  // The comments of many bears with ONE round trip. Every requested id is in
  // the result, with an empty array if the bear has no comments. This is the
  // answer to the N+1 problem: callers never loop over listByBear.
  listByBears: (bearIds: readonly string[]) => Promise<Map<string, Comment[]>>;
  // The repository assigns id and createdAt.
  add: (bearId: string, input: CreateComment) => Promise<Comment>;
  // false if there was no such comment.
  delete: (id: string) => Promise<boolean>;
}
