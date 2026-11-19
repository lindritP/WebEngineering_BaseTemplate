import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { describe, it } from 'node:test';
import { InMemoryCommentRepository } from './inMemoryCommentRepository.js';
import { InMemoryTransactionRunner } from './inMemoryTransactionRunner.js';
import { ReportService } from './reportService.js';

const CONCURRENT_REPORTS = 50;

function setup(): {
  comments: InMemoryCommentRepository;
  service: ReportService;
} {
  const comments = new InMemoryCommentRepository();
  const service = new ReportService(
    comments,
    new InMemoryTransactionRunner({ comments })
  );
  return { comments, service };
}

async function addComment(
  comments: InMemoryCommentRepository
): Promise<string> {
  const { id } = await comments.add('u-arctos', { author: 'A', text: 'x' });
  return id;
}

describe('ReportService', () => {
  it('counts every report and hides the comment at the third', async () => {
    const { comments, service } = setup();
    const id = await addComment(comments);

    const first = await service.report(id);
    const second = await service.report(id);
    const third = await service.report(id);

    assert.deepEqual(
      [first?.reportCount, second?.reportCount, third?.reportCount],
      [1, 2, 3]
    );
    assert.equal(first?.hiddenAt, null);
    assert.equal(second?.hiddenAt, null);
    assert.notEqual(third?.hiddenAt, null);
  });

  it('keeps the original hiding time when a hidden comment is reported again', async () => {
    const { comments, service } = setup();
    const id = await addComment(comments);
    await service.report(id);
    await service.report(id);
    const hidden = await service.report(id);

    const again = await service.report(id);

    assert.equal(again?.reportCount, 4);
    assert.equal(again.hiddenAt, hidden?.hiddenAt);
  });

  it('returns undefined for an unknown comment', async () => {
    const { service } = setup();

    assert.equal(await service.report(randomUUID()), undefined);
    assert.equal(await service.reportNaively(randomUUID()), undefined);
  });

  it('LOSES reports when the naive version runs concurrently', async () => {
    const { comments, service } = setup();
    const id = await addComment(comments);

    await Promise.all(
      Array.from({ length: CONCURRENT_REPORTS }, async () => {
        await service.reportNaively(id);
      })
    );

    // Every request read the count before any of them wrote: all 50 saw 0
    // and wrote 1. (Against PostgreSQL the loss is partial and varies: see
    // npm run demo:lost-update.)
    const final = await comments.findById(id);
    assert.ok(final !== undefined);
    assert.ok(final.reportCount < CONCURRENT_REPORTS);
  });

  it('ends with exactly 50 when the transactional version runs concurrently', async () => {
    const { comments, service } = setup();
    const id = await addComment(comments);

    await Promise.all(
      Array.from({ length: CONCURRENT_REPORTS }, async () => {
        await service.report(id);
      })
    );

    const final = await comments.findById(id);
    assert.equal(final?.reportCount, CONCURRENT_REPORTS);
  });
});
