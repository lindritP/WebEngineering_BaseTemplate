import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
} from 'fastify-type-provider-zod';
import { API_VERSION } from './version.js';

// Builds an OpenAPI 3.1 document from the zod schemas of the routes, so the
// documentation cannot drift from what the API really validates. Must be
// registered before the routes: it collects them as they are added.
// UI: /api/docs, raw document: /api/docs/json.
export async function registerOpenApi(app: FastifyInstance): Promise<void> {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Bears API',
        description:
          'Backend for Frontend of the bears web app. Every error is RFC 9457 Problem Details (application/problem+json); every response carries an x-request-id header.',
        version: API_VERSION,
      },
      tags: [
        { name: 'bears', description: 'Bear species, loaded from Wikipedia' },
        { name: 'comments', description: 'Comments on a bear (in memory)' },
        { name: 'health', description: 'Operations' },
      ],
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  });
  await app.register(fastifySwaggerUi, { routePrefix: '/api/docs' });
}
