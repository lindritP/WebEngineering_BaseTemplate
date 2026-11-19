import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildTestApp } from '../test/testApp.js';

describe('health routes', () => {
  it('/health/ready answers 200 when the check passes', async () => {
    const app = await buildTestApp();

    const res = await app.inject({ method: 'GET', url: '/health/ready' });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), { status: 'ready', database: 'up' });
    await app.close();
  });

  it('/health/ready answers 503 when the check fails, and hides why', async () => {
    const app = await buildTestApp({
      checkReady: async () => {
        throw await Promise.resolve(
          new Error('connect ECONNREFUSED 10.0.0.5:5432')
        );
      },
    });

    const res = await app.inject({ method: 'GET', url: '/health/ready' });

    assert.equal(res.statusCode, 503);
    assert.match(
      res.headers['content-type'] ?? '',
      /^application\/problem\+json/v
    );
    // The driver's message (with an internal address) stays in the log.
    assert.doesNotMatch(res.body, /ECONNREFUSED|10\.0\.0\.5/v);
    await app.close();
  });

  it('/health stays 200 while readiness fails (liveness ignores the database)', async () => {
    const app = await buildTestApp({
      checkReady: async () => {
        throw await Promise.resolve(new Error('database down'));
      },
    });

    const res = await app.inject({ method: 'GET', url: '/health' });

    assert.equal(res.statusCode, 200);
    assert.equal(res.json<{ status: string }>().status, 'ok');
    await app.close();
  });
});
