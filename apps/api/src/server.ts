import { buildApp } from './app.js';

const DEFAULT_PORT = 3000;
const FAILURE_EXIT_CODE = 1;
const port = Number(process.env.PORT ?? DEFAULT_PORT);

const app = buildApp();

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(FAILURE_EXIT_CODE);
}
