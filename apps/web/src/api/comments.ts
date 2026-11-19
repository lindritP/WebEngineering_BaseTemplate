import { z } from 'zod';
import type { Comment, CommentPage, NewComment } from '../types.ts';
import { toApiError } from './problem.ts';
import { apiUrl } from './url.ts';

const NOT_FOUND = 404;

const CommentSchema: z.ZodType<Comment> = z.object({
  id: z.string().nonempty(),
  bearId: z.string().nonempty(),
  author: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

const CommentPageSchema: z.ZodType<CommentPage> = z.object({
  items: z.array(CommentSchema),
  nextCursor: z.string().nullable(),
});

function commentsUrl(bearId: string): string {
  return apiUrl(`/api/bears/${encodeURIComponent(bearId)}/comments`);
}

async function parseResponse<T>(
  res: Response,
  schema: z.ZodType<T>
): Promise<T> {
  if (!res.ok) {
    throw await toApiError(res);
  }
  const result = schema.safeParse(await res.json());
  if (!result.success) {
    throw new Error('Unexpected response from the API', {
      cause: result.error,
    });
  }
  return result.data;
}

// One page, newest first. Without a cursor it is the first page; with the
// nextCursor of the previous page it continues right after that page.
export async function fetchComments(
  bearId: string,
  signal: AbortSignal,
  cursor?: string
): Promise<CommentPage> {
  const query =
    cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`;
  const res = await fetch(`${commentsUrl(bearId)}${query}`, { signal });
  return await parseResponse(res, CommentPageSchema);
}

export async function createComment(
  bearId: string,
  input: NewComment
): Promise<Comment> {
  const res = await fetch(commentsUrl(bearId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return await parseResponse(res, CommentSchema);
}

export async function deleteComment(commentId: string): Promise<void> {
  const res = await fetch(
    apiUrl(`/api/comments/${encodeURIComponent(commentId)}`),
    {
      method: 'DELETE',
    }
  );
  // DELETE is idempotent: a 404 means the comment is already gone (for
  // example deleted in another tab), which is the state the user wanted.
  if (!res.ok && res.status !== NOT_FOUND) {
    throw await toApiError(res);
  }
}
