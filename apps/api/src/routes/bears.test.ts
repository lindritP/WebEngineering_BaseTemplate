import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../test/testApp.js';

describe('bear routes', () => {
  let app: FastifyInstance;
  before(async () => {
    app = await buildTestApp();
  });
  after(async () => {
    await app.close();
  });

  it('lists the bears sorted by name', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/bears' });

    assert.equal(res.statusCode, 200);
    const names = res.json<Array<{ name: string }>>().map((bear) => bear.name);
    assert.deepEqual(names, ['Brown bear', 'Giant panda']);
  });

  it('returns one bear by id', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/bears/u-arctos' });

    assert.equal(res.statusCode, 200);
    assert.equal(res.json<{ binomial: string }>().binomial, 'U. arctos');
  });

  it('answers 404 Problem Details for an unknown bear', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/bears/nope' });

    assert.equal(res.statusCode, 404);
    assert.match(
      res.headers['content-type'] ?? '',
      /^application\/problem\+json/v
    );
    assert.equal(res.json<{ type: string }>().type, '/problems/not-found');
  });
});
