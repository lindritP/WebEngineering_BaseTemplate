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

    it('delete reports whether a comment existed', async () => {
      const comments = create();
      const { id } = await comments.add('u-arctos', { author: 'A', text: 'x' });

      assert.equal(await comments.delete(id), true);
      assert.equal(await comments.delete(id), false);
      assert.deepEqual(await comments.listByBear('u-arctos'), []);
    });
  });
}
