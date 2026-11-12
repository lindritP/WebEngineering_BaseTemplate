import { z } from 'zod';
import type { Comment, NewComment } from '../types.ts';

const NOT_FOUND = 404;

const CommentSchema: z.ZodType<Comment> = z.object({
  id: z.string().nonempty(),
  bearId: z.string().nonempty(),
  author: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

const CommentListSchema = z.array(CommentSchema);

function commentsUrl(bearId: string): string {
  return `/api/bears/${encodeURIComponent(bearId)}/comments`;
}

async function parseResponse<T>(
  res: Response,
  schema: z.ZodType<T>
): Promise<T> {
  if (!res.ok) {
    throw new Error(`The API answered with status ${res.status}`);
  }
  const result = schema.safeParse(await res.json());
  if (!result.success) {
    throw new Error('Unexpected response from the API', {
      cause: result.error,
    });
  }
  return result.data;
}

export async function fetchComments(
  bearId: string,
  signal: AbortSignal
): Promise<Comment[]> {
  const res = await fetch(commentsUrl(bearId), { signal });
  return await parseResponse(res, CommentListSchema);
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
  const res = await fetch(`/api/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  });
  // DELETE is idempotent: a 404 means the comment is already gone (for
  // example deleted in another tab), which is the state the user wanted.
  if (!res.ok && res.status !== NOT_FOUND) {
    throw new Error(`The API answered with status ${res.status}`);
  }
}
