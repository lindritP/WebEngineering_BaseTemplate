import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import { config } from './config.js';

const PREFLIGHT_MAX_AGE_SECONDS = 600;

// CORS is enforced by the browser; the server only says which origins may
// read its responses. Everything not listed gets no CORS headers, so the
// browser blocks the response.
export async function registerCors(app: FastifyInstance): Promise<void> {
  await app.register(cors, {
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'DELETE'],
    // A JSON body makes a POST "non-simple", so the browser asks first.
    allowedHeaders: ['Content-Type'],
    // Without this, cross-origin JavaScript cannot read these headers.
    exposedHeaders: ['X-Request-Id', 'Location'],
    // Browsers may cache a successful preflight for this many seconds.
    maxAge: PREFLIGHT_MAX_AGE_SECONDS,
  });
}
