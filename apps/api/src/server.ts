import { buildApp } from './app.js';
import { config } from './config.js';

const FAILURE_EXIT_CODE = 1;

const app = await buildApp();

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(FAILURE_EXIT_CODE);
}
