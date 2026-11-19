import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { BearListSchema, BearSchema } from '../bears/bear.js';
import type { BearRepository } from '../bears/bearRepository.js';
import { requireBear } from '../bears/requireBear.js';
import { NOT_FOUND, OK } from '../httpStatus.js';
import { problemResponses } from '../problemDetails.js';

export const BearParamsSchema = z.object({
  id: z.string().describe('Slug of the binomial name, e.g. "u-arctos"'),
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
        summary: 'List all bear species',
        response: {
          [OK]: BearListSchema,
          ...problemResponses([]),
        },
      },
    },
    async () => await bears.list()
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
