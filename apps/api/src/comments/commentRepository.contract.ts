import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CommentRepository } from './commentRepository.js';

// The behaviour every CommentRepository must have, whatever it stores the
// comments in. The in-memory version runs it in the unit tests; the same
// function can be pointed at the Drizzle version with a real database.
export function describeCommentRepository(
  name: string,
  create: () => CommentRepository
): void {
  describe(`${name} (CommentRepository contract)`, () => {
    it('assigns an id and a creation time', async () => {
      const comments = create();

      const comment = await comments.add('u-arctos', {
        author: 'Anna',
        text: 'hi',
      });

      assert.match(
        comment.id,
        /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/v
      );
      assert.ok(!Number.isNaN(Date.parse(comment.createdAt)));
    });

    it('lists the comments of a bear oldest first and only that bear', async () => {
      const comments = create();
      await comments.add('u-arctos', { author: 'A', text: 'first' });
      await comments.add('a-melanoleuca', { author: 'B', text: 'other' });
      await comments.add('u-arctos', { author: 'C', text: 'second' });

      const list = await comments.listByBear('u-arctos');

      assert.deepEqual(
        list.map((comment) => comment.text),
        ['first', 'second']
      );
    });

    it('listByBears returns every requested bear, empty ones included', async () => {
      const comments = create();
      await comments.add('u-arctos', { author: 'A', text: 'one' });
      await comments.add('u-arctos', { author: 'B', text: 'two' });

      const byBear = await comments.listByBears(['u-arctos', 'h-malayanus']);

      assert.equal(byBear.get('u-arctos')?.length, 2);
      assert.deepEqual(byBear.get('h-malayanus'), []);
      assert.equal((await comments.listByBears([])).size, 0);
    });

    it('pages newest first and continues exactly where the cursor says', async () => {
      const comments = create();
      for (const text of ['1', '2', '3', '4', '5']) {
        // eslint-disable-next-line no-await-in-loop -- sequential on purpose: each comment must get its own, later creation time
        await comments.add('u-arctos', { author: 'A', text });
      }
      await comments.add('a-melanoleuca', { author: 'B', text: 'other' });

      const first = await comments.pageByBear('u-arctos', { limit: 2 });
      assert.equal(first.items.length, 2);
      assert.ok(first.nextCursor !== undefined);
      const second = await comments.pageByBear('u-arctos', {
        limit: 2,
        after: first.nextCursor,
      });
      assert.ok(second.nextCursor !== undefined);
      const third = await comments.pageByBear('u-arctos', {
        limit: 2,
        after: second.nextCursor,
      });

      // Every comment exactly once, none skipped, none repeated, and the
      // last page has no cursor.
      const seen = [...first.items, ...second.items, ...third.items];
      assert.equal(new Set(seen.map((comment) => comment.id)).size, 5);
      assert.equal(third.items.length, 1);
      assert.equal(third.nextCursor, undefined);
      const all = await comments.listByBear('u-arctos');
      assert.deepEqual(
        new Set(seen.map((comment) => comment.id)),
        new Set(all.map((comment) => comment.id))
      );
      // Newest first. Comments created in the same millisecond tie on
      // createdAt, so the id decides, as it does in the cursor. (ISO strings
      // of equal precision sort like the instants they stand for.)
      const keys = seen.map((comment) => `${comment.createdAt}|${comment.id}`);
      assert.deepEqual(keys, [...keys].sort().reverse());
    });

    it('has no next cursor when the page is exactly full and nothing follows', async () => {
      const comments = create();
      await comments.add('u-arctos', { author: 'A', text: 'one' });
      await comments.add('u-arctos', { author: 'A', text: 'two' });

      const page = await comments.pageByBear('u-arctos', { limit: 2 });

      assert.equal(page.items.length, 2);
      assert.equal(page.nextCursor, undefined);
    });

    it('delete reports whether a comment existed', async () => {
      const comments = create();
      const { id } = await comments.add('u-arctos', { author: 'A', text: 'x' });

      assert.equal(await comments.delete(id), true);
      assert.equal(await comments.delete(id), false);
      assert.deepEqual(await comments.listByBear('u-arctos'), []);
    });
  });
}
