import type { FastifyInstance } from 'fastify';
import { findBear } from '../bears/findBear.js';
import { CreateCommentSchema } from '../comments/comment.js';
import type { InMemoryCommentStore } from '../comments/commentStore.js';
import { NotFoundError, ValidationError } from '../errors.js';

const CREATED = 201;
const NO_CONTENT = 204;

interface BearParams {
  Params: { id: string };
}

interface CommentParams {
  Params: { commentId: string };
}

export function registerCommentRoutes(
  app: FastifyInstance,
  store: InMemoryCommentStore
): void {
  app.get<BearParams>('/api/bears/:id/comments', async ({ params: { id } }) => {
    await findBear(id);
    return store.list(id);
  });

  app.post<BearParams>(
    '/api/bears/:id/comments',
    async ({ params: { id }, body }, reply) => {
      await findBear(id);

      const result = CreateCommentSchema.safeParse(body);
      if (!result.success) {
        throw ValidationError.fromZod(result.error);
      }

      const comment = store.add(id, result.data);
      void reply
        .code(CREATED)
        .header('Location', `/api/comments/${comment.id}`);
      return comment;
    }
  );

  // Synchronous handler: the store answers immediately, and reply.send()
  // ends the request without a body, as 204 No Content requires.
  app.delete<CommentParams>(
    '/api/comments/:commentId',
    ({ params: { commentId } }, reply) => {
      if (!store.delete(commentId)) {
        throw new NotFoundError(`No comment with id "${commentId}"`);
      }
      void reply.code(NO_CONTENT).send();
    }
  );
}
