import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

export const REQUEST_ID_HEADER = 'x-request-id';

const RequestIdSchema = z.uuid();

// Passed to fastify({ genReqId }). An id from the caller (a proxy, another
// service) is kept so one request can be followed across systems, but only
// if it is a UUID: anything else could inject text into our logs.
export function generateRequestId(request: IncomingMessage): string {
  const result = RequestIdSchema.safeParse(request.headers[REQUEST_ID_HEADER]);
  return result.success ? result.data : randomUUID();
}

// Every response, success or error, tells the client its request id.
export function registerRequestIdHeader(app: FastifyInstance): void {
  app.addHook('onRequest', (request, reply, done) => {
    void reply.header(REQUEST_ID_HEADER, request.id);
    done();
  });
}
