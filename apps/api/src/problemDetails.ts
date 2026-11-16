import { STATUS_CODES } from 'node:http';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { HttpError, NotFoundError, ValidationError } from './errors.js';

export const PROBLEM_CONTENT_TYPE = 'application/problem+json';

const CLIENT_ERROR_MIN = 400;
const SERVER_ERROR_MIN = 500;

// RFC 9457. `errors` is an extension member, only sent for validation errors.
// The id makes it one shared "Problem" component in the OpenAPI document.
export const ProblemSchema = z
  .object({
    type: z.string().describe('URI reference that identifies the problem type'),
    title: z.string().describe('Short summary of the problem type'),
    status: z.int().describe('HTTP status code'),
    detail: z.string().describe('Explanation of this occurrence, for humans'),
    instance: z.string().describe('urn:uuid: plus the request id'),
    errors: z
      .array(z.object({ pointer: z.string(), detail: z.string() }))
      .optional()
      .describe('Invalid fields (validation errors only)'),
  })
  .meta({ id: 'Problem', description: 'RFC 9457 Problem Details' });

export type Problem = z.infer<typeof ProblemSchema>;

// Documents the error responses of a route. Every route can also fail with
// an unexpected 500, so that one is always included.
export function problemResponses(
  statuses: number[]
): Record<number, { description: string; content: object }> {
  return Object.fromEntries(
    [...statuses, SERVER_ERROR_MIN].map((status) => [
      status,
      {
        description: STATUS_CODES[status] ?? 'Error',
        content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemSchema } },
      },
    ])
  );
}

// Fastify's own client errors (invalid JSON, unsupported content type, body
// too large, ...). Their messages are written for clients, so they may pass.
function isFastifyClientError(
  error: unknown
): error is Error & { statusCode: number } {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    error.statusCode >= CLIENT_ERROR_MIN &&
    error.statusCode < SERVER_ERROR_MIN
  );
}

// A request that fails a route's zod schema arrives here as Fastify's
// validation error. It becomes our ValidationError, so the client gets the
// same 400 with an `errors` array as for any other invalid input.
function normalize(error: unknown): unknown {
  if (!hasZodFastifySchemaValidationErrors(error)) {
    return error;
  }
  const errors = error.validation.map(({ instancePath, message }) => ({
    pointer: instancePath === '/' ? '#' : `#${instancePath}`,
    detail: message ?? 'Invalid value',
  }));
  return new ValidationError(errors, { cause: error });
}

function toProblem(error: unknown, request: FastifyRequest): Problem {
  // request.id is always a UUID (see requestId.ts), so this is a valid URI.
  const instance = `urn:uuid:${request.id}`;

  if (error instanceof HttpError) {
    return {
      type: error.type,
      title: error.title,
      status: error.statusCode,
      detail: error.detail,
      instance,
      ...(error instanceof ValidationError && { errors: error.errors }),
    };
  }

  if (isFastifyClientError(error)) {
    return {
      type: 'about:blank',
      title: STATUS_CODES[error.statusCode] ?? 'Bad Request',
      status: error.statusCode,
      detail: error.message,
      instance,
    };
  }

  // Everything else is a bug on our side. The client learns nothing about
  // it except the request id; message and stack trace stay in the log.
  return {
    type: 'about:blank',
    title: 'Internal Server Error',
    status: SERVER_ERROR_MIN,
    detail: 'An unexpected error occurred. Please try again later.',
    instance,
  };
}

export function registerProblemDetails(app: FastifyInstance): void {
  app.setErrorHandler((rawError, request, reply) => {
    const error = normalize(rawError);
    const problem = toProblem(error, request);

    // request.log adds the request id to the log line automatically.
    if (problem.status >= SERVER_ERROR_MIN) {
      request.log.error({ err: error }, 'request failed');
    } else {
      request.log.info({ err: error }, 'request rejected');
    }

    void reply.code(problem.status).type(PROBLEM_CONTENT_TYPE).send(problem);
  });

  // Unknown routes get the same format instead of Fastify's default 404.
  app.setNotFoundHandler(({ method, url }) => {
    throw new NotFoundError(`No route for ${method} ${url}`);
  });
}
