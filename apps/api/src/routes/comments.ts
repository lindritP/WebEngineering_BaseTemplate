import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { findBear } from '../bears/bearQueries.js';
import { CommentSchema, CreateCommentSchema } from '../comments/comment.js';
import type { InMemoryCommentStore } from '../comments/commentStore.js';
import type { Database } from '../db/client.js';
import { NotFoundError } from '../errors.js';
import {
  BAD_REQUEST,
  CREATED,
  NO_CONTENT,
  NOT_FOUND,
  OK,
} from '../httpStatus.js';
import { problemResponses } from '../problemDetails.js';
import { BearParamsSchema } from './bears.js';

const CommentParamsSchema = z.object({ commentId: z.string() });

export function registerCommentRoutes(
  app: FastifyInstance,
  store: InMemoryCommentStore,
  db: Database
): void {
  const api = app.withTypeProvider<ZodTypeProvider>();

  api.get(
    '/api/bears/:id/comments',
    {
      schema: {
        tags: ['comments'],
        summary: 'List the comments of a bear, oldest first',
        params: BearParamsSchema,
        response: {
          [OK]: z.array(CommentSchema),
          ...problemResponses([NOT_FOUND]),
        },
      },
    },
    async ({ params: { id } }) => {
      await findBear(db, id);
      return store.list(id);
    }
  );

  // The body is validated by the schema before the handler runs: an invalid
  // body is a 400 without a database lookup.
  api.post(
    '/api/bears/:id/comments',
    {
      schema: {
        tags: ['comments'],
        summary: 'Add a comment to a bear',
        params: BearParamsSchema,
        body: CreateCommentSchema,
        response: {
          [CREATED]: CommentSchema.describe(
            'The new comment; its URL is in the Location header'
          ),
          ...problemResponses([BAD_REQUEST, NOT_FOUND]),
        },
      },
    },
    async ({ params: { id }, body }, reply) => {
      await findBear(db, id);
      const comment = store.add(id, body);
      void reply
        .code(CREATED)
        .header('Location', `/api/comments/${comment.id}`);
      return comment;
    }
  );

  // Synchronous handler: the store answers immediately, and reply.send()
  // ends the request without a body, as 204 No Content requires.
  api.delete(
    '/api/comments/:commentId',
    {
      schema: {
        tags: ['comments'],
        summary: 'Delete a comment',
        params: CommentParamsSchema,
        response: {
          [NO_CONTENT]: z.undefined().describe('Comment deleted'),
          ...problemResponses([NOT_FOUND]),
        },
      },
    },
    ({ params: { commentId } }, reply) => {
      if (!store.delete(commentId)) {
        throw new NotFoundError(`No comment with id "${commentId}"`);
      }
      void reply.code(NO_CONTENT).send();
    }
  );
}
