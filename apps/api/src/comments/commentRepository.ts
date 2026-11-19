import type { Comment, CreateComment } from './comment.js';
import type { CommentCursor } from './cursor.js';

export interface PageRequest {
  limit: number;
  // Continue after this position; without it the page starts at the newest.
  after?: CommentCursor;
}

// What the report feature changes on a comment.
export interface ReportState {
  reportCount: number;
  // When the comment was hidden, null while it is visible.
  hiddenAt: string | null;
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
  // One comment by id, hidden ones included (they can still be reported).
  // undefined if there is none.
  findById: (id: string) => Promise<Comment | undefined>;
  // Like findById, but asks the database for a row lock (SELECT ... FOR
  // UPDATE): inside a transaction, every other transaction that wants the
  // same lock waits until this one commits or rolls back. Outside a
  // transaction the lock ends with the statement and protects nothing, so
  // only a service that opened a transaction should call it.
  findByIdForUpdate: (id: string) => Promise<Comment | undefined>;
  // Overwrites the report state (a plain write: deciding the new values is the
  // caller's job). undefined if there is no such comment.
  saveReportState: (
    id: string,
    state: ReportState
  ) => Promise<Comment | undefined>;
  // false if there was no such comment.
  delete: (id: string) => Promise<boolean>;
}
