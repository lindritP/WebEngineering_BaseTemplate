import type { z } from 'zod';

// Every error the API throws on purpose extends HttpError. The central error
// handler (problemDetails.ts) turns it into RFC 9457 Problem Details.
// `message` is for the server log, `detail` is what the client may see.
export abstract class HttpError extends Error {
  abstract readonly statusCode: number;
  abstract readonly type: string;
  abstract readonly title: string;
  // What the client may see. By default the message; subclasses whose message
  // contains internals replace it with a fixed text.
  readonly detail: string;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.detail = message;
  }
}

export class NotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly type = '/problems/not-found';
  readonly title = 'Resource not found';
}

// One entry per invalid field. `pointer` is a JSON Pointer into the request
// body ("#/author"), the format RFC 9457 uses in its own example.
export interface FieldError {
  pointer: string;
  detail: string;
}

function toJsonPointer(path: PropertyKey[]): string {
  const segments = path.map((segment) =>
    String(segment).replaceAll('~', '~0').replaceAll('/', '~1')
  );
  return ['#', ...segments].join('/');
}

export class ValidationError extends HttpError {
  readonly statusCode = 400;
  readonly type = '/problems/validation-error';
  readonly title = 'Invalid request';
  readonly errors: FieldError[];

  constructor(errors: FieldError[], options?: ErrorOptions) {
    const fields = errors.map(({ pointer }) =>
      pointer === '#' ? 'body' : pointer.replace('#/', '')
    );
    super(`Please check these fields: ${fields.join(', ')}`, options);
    this.errors = errors;
  }

  static fromZod(error: z.ZodError): ValidationError {
    const errors = error.issues.map(({ path, message }) => ({
      pointer: toJsonPointer(path),
      detail: message,
    }));
    return new ValidationError(errors, { cause: error });
  }
}

// Upstream messages ("Wikipedia answered with status 404") only go to the log.
// The client gets one fixed sentence: how Wikipedia failed is our problem.
const UPSTREAM_DETAIL =
  'The bear data could not be loaded from Wikipedia. Please try again later.';

export class UpstreamError extends HttpError {
  readonly statusCode = 502;
  readonly type = '/problems/upstream-error';
  readonly title = 'Upstream service failed';
  override readonly detail = UPSTREAM_DETAIL;
}

export class UpstreamTimeoutError extends HttpError {
  readonly statusCode = 504;
  readonly type = '/problems/upstream-timeout';
  readonly title = 'Upstream service timed out';
  override readonly detail = UPSTREAM_DETAIL;
}
