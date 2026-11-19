import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { BearListSchema, BearSchema } from '../bears/bear.js';
import type { BearRepository } from '../bears/bearRepository.js';
import { requireBear } from '../bears/requireBear.js';
import { BAD_REQUEST, NOT_FOUND, OK } from '../httpStatus.js';
import { problemResponses } from '../problemDetails.js';

export const BearParamsSchema = z.object({
  id: z.string().describe('Slug of the binomial name, e.g. "u-arctos"'),
});

const MAX_QUERY_LENGTH = 100;

const BearListQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(MAX_QUERY_LENGTH)
    .optional()
    .describe('Only bears whose name contains this text (case-insensitive)'),
});

export function registerBearRoutes(
  app: FastifyInstance,
  bears: BearRepository
): void {
  const api = app.withTypeProvider<ZodTypeProvider>();

  api.get(
    '/api/bears',
    {
      schema: {
        tags: ['bears'],
        summary: 'List bear species, optionally filtered by name',
        querystring: BearListQuerySchema,
        response: {
          [OK]: BearListSchema,
          ...problemResponses([BAD_REQUEST]),
        },
      },
    },
    async ({ query: { q } }) => await bears.list(q)
  );

  api.get(
    '/api/bears/:id',
    {
      schema: {
        tags: ['bears'],
        summary: 'Get one bear species',
        params: BearParamsSchema,
        response: {
          [OK]: BearSchema,
          ...problemResponses([NOT_FOUND]),
        },
      },
    },
    async ({ params: { id } }) => await requireBear(bears, id)
  );
}
