import { z } from 'zod';

const AUTHOR_MAX_LENGTH = 50;
const TEXT_MAX_LENGTH = 1000;

// What a client may send. trim() runs first, so "   " counts as empty.
// id, bearId and createdAt are set by the server, never by the client.
export const CreateCommentSchema = z.object({
  author: z.string().trim().nonempty().max(AUTHOR_MAX_LENGTH),
  text: z.string().trim().nonempty().max(TEXT_MAX_LENGTH),
});

// What the API sends back.
export const CommentSchema = CreateCommentSchema.extend({
  id: z.uuid(),
  bearId: z.string(),
  createdAt: z.iso.datetime(),
});

export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type Comment = z.infer<typeof CommentSchema>;
