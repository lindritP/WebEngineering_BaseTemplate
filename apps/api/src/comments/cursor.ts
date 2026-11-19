import { z } from 'zod';

// Where the previous page ended: the sort key of its last comment. created_at
// alone is not enough (two comments can share an instant), id breaks the tie,
// so (createdAt, id) is unique and gives every comment exactly one position.
//
// createdAt is an ISO string with the precision the store has: PostgreSQL
// keeps microseconds, a JavaScript Date only milliseconds. Going through Date
// would round the cursor and skip rows, so the string is passed along as is.
export interface CommentCursor {
  createdAt: string;
  id: string;
}

const CursorSchema = z.object({
  createdAt: z.iso.datetime(),
  id: z.uuid(),
});

// Clients treat the cursor as an opaque token. Encoding it hides the format,
// so it can change later without breaking a client, and keeps it URL-safe.
export function encodeCursor(cursor: CommentCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

// undefined for anything that is not a cursor this API issued.
export function decodeCursor(token: string): CommentCursor | undefined {
  try {
    const json: unknown = JSON.parse(
      Buffer.from(token, 'base64url').toString('utf8')
    );
    const result = CursorSchema.safeParse(json);
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
}
