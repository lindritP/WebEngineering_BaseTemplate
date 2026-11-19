import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import { buildTestApp } from '../test/testApp.js';

interface CommentBody {
  id: string;
  bearId: string;
  author: string;
  text: string;
}

describe('comment routes', () => {
  let app: FastifyInstance;
  // A fresh app (and so a fresh, empty repository) for every test.
  beforeEach(async () => {
    app = await buildTestApp();
  });
  afterEach(async () => {
    await app.close();
  });

  async function post(
    bearId: string,
    payload: object
  ): Promise<LightMyRequestResponse> {
    return await app.inject({
      method: 'POST',
      url: `/api/bears/${bearId}/comments`,
      payload,
    });
  }

  it('creates a comment: 201 with a Location header', async () => {
    const res = await post('u-arctos', { author: 'Anna', text: 'Nice bear' });

    assert.equal(res.statusCode, 201);
    const comment = res.json<CommentBody>();
    assert.equal(res.headers.location, `/api/comments/${comment.id}`);
    assert.equal(comment.bearId, 'u-arctos');
  });

  it('lists the comments of one bear, oldest first', async () => {
    await post('u-arctos', { author: 'A', text: 'first' });
    await post('u-arctos', { author: 'B', text: 'second' });
    await post('a-melanoleuca', { author: 'C', text: 'other bear' });

    const res = await app.inject({
      method: 'GET',
      url: '/api/bears/u-arctos/comments',
    });

    assert.deepEqual(
      res.json<CommentBody[]>().map((comment) => comment.text),
      ['first', 'second']
    );
  });

  it('trims the input and rejects a blank author with 400', async () => {
    const trimmed = await post('u-arctos', { author: '  Anna ', text: ' hi ' });
    assert.equal(res(trimmed).author, 'Anna');

    const blank = await post('u-arctos', { author: '   ', text: 'hi' });
    assert.equal(blank.statusCode, 400);
    assert.equal(
      blank.json<{ type: string }>().type,
      '/problems/validation-error'
    );
  });

  it('answers 404 for comments of an unknown bear', async () => {
    const res = await post('nope', { author: 'A', text: 'x' });

    assert.equal(res.statusCode, 404);
  });

  it('deletes a comment: 204, then 404 for the same id', async () => {
    const created = res(await post('u-arctos', { author: 'A', text: 'x' }));

    const first = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${created.id}`,
    });
    const second = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${created.id}`,
    });

    assert.equal(first.statusCode, 204);
    assert.equal(second.statusCode, 404);
  });

  it('answers 400 for a comment id that is not a uuid', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/comments/not-a-uuid',
    });

    assert.equal(res.statusCode, 400);
  });
});

function res(response: LightMyRequestResponse): CommentBody {
  return response.json<CommentBody>();
}
