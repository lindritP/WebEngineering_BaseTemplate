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

interface PageBody {
  items: CommentBody[];
  nextCursor: string | null;
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

  async function getPage(query: string): Promise<LightMyRequestResponse> {
    return await app.inject({
      method: 'GET',
      url: `/api/bears/u-arctos/comments${query}`,
    });
  }

  it('lists the comments of one bear, newest first', async () => {
    await post('u-arctos', { author: 'A', text: 'first' });
    await post('u-arctos', { author: 'B', text: 'second' });
    await post('a-melanoleuca', { author: 'C', text: 'other bear' });

    const res = await getPage('');

    assert.equal(res.statusCode, 200);
    const page = res.json<PageBody>();
    assert.deepEqual(
      page.items.map((comment) => comment.text),
      ['second', 'first']
    );
    assert.equal(page.nextCursor, null);
  });

  it('pages with limit and cursor without skipping or repeating', async () => {
    for (const text of ['1', '2', '3', '4', '5']) {
      // eslint-disable-next-line no-await-in-loop -- sequential on purpose: the creation order is what the test checks
      await post('u-arctos', { author: 'A', text });
    }

    const first = (await getPage('?limit=2')).json<PageBody>();
    const second = (
      await getPage(`?limit=2&cursor=${first.nextCursor ?? ''}`)
    ).json<PageBody>();
    const third = (
      await getPage(`?limit=2&cursor=${second.nextCursor ?? ''}`)
    ).json<PageBody>();

    const texts = [...first.items, ...second.items, ...third.items].map(
      (comment) => comment.text
    );
    assert.deepEqual(texts, ['5', '4', '3', '2', '1']);
    assert.notEqual(first.nextCursor, null);
    assert.notEqual(second.nextCursor, null);
    assert.equal(third.nextCursor, null);
  });

  it('keeps a page stable when a newer comment arrives meanwhile', async () => {
    for (const text of ['1', '2', '3']) {
      // eslint-disable-next-line no-await-in-loop -- sequential on purpose: the creation order is what the test checks
      await post('u-arctos', { author: 'A', text });
    }
    const first = (await getPage('?limit=2')).json<PageBody>();

    // With OFFSET this would shift every row by one and repeat "2".
    await post('u-arctos', { author: 'A', text: 'new' });
    const second = (
      await getPage(`?limit=2&cursor=${first.nextCursor ?? ''}`)
    ).json<PageBody>();

    assert.deepEqual(
      second.items.map((comment) => comment.text),
      ['1']
    );
  });

  it('rejects a bad limit and a made-up cursor with 400', async () => {
    for (const query of [
      '?limit=0',
      '?limit=101',
      '?limit=abc',
      '?cursor=xyz',
    ]) {
      // eslint-disable-next-line no-await-in-loop -- one request per bad input, order does not matter
      const res = await getPage(query);
      assert.equal(res.statusCode, 400, query);
    }
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
