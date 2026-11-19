import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { BearRepository } from '../bears/bearRepository.js';
import { requireBear } from '../bears/requireBear.js';
import { CommentSchema, CreateCommentSchema } from '../comments/comment.js';
import type { CommentRepository } from '../comments/commentRepository.js';
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

// A malformed id can never exist: 400, and Postgres is not even asked (it
// would reject a non-uuid value with an error of its own).
const CommentParamsSchema = z.object({ commentId: z.uuid() });

export function registerCommentRoutes(
  app: FastifyInstance,
  comments: CommentRepository,
  bears: BearRepository
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
      await requireBear(bears, id);
      return await comments.listByBear(id);
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
      await requireBear(bears, id);
      const comment = await comments.add(id, body);
      void reply
        .code(CREATED)
        .header('Location', `/api/comments/${comment.id}`);
      return comment;
    }
  );

  // reply.send() ends the request without a body, as 204 No Content requires.
  api.delete(
    '/api/comments/:commentId',
    {
      schema: {
        tags: ['comments'],
        summary: 'Delete a comment',
        params: CommentParamsSchema,
        response: {
          [NO_CONTENT]: z.undefined().describe('Comment deleted'),
          ...problemResponses([BAD_REQUEST, NOT_FOUND]),
        },
      },
    },
    async ({ params: { commentId } }, reply) => {
      if (!(await comments.delete(commentId))) {
        throw new NotFoundError(`No comment with id "${commentId}"`);
      }
      return await reply.code(NO_CONTENT).send();
    }
  );
}
