import { STATUS_CODES } from 'node:http';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { HttpError, NotFoundError, ValidationError } from './errors.js';
import type { FieldError } from './errors.js';

export const PROBLEM_CONTENT_TYPE = 'application/problem+json';

const CLIENT_ERROR_MIN = 400;
const SERVER_ERROR_MIN = 500;

// RFC 9457. `errors` is an extension member, only sent for validation errors.
export interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: FieldError[];
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
  app.setErrorHandler((error, request, reply) => {
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
