import { readFileSync } from 'node:fs';
import type { FastifyInstance } from 'fastify';

function readVersion(): string {
  const pkg: unknown = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
  );
  if (
    typeof pkg === 'object' &&
    pkg !== null &&
    'version' in pkg &&
    typeof pkg.version === 'string'
  ) {
    return pkg.version;
  }
  return 'unknown';
}

const version = readVersion();

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get('/health', () => ({
    status: 'ok',
    version,
    uptime: process.uptime(),
  }));
}
