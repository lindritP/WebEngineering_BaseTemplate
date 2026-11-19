import type {
  TransactionalRepositories,
  TransactionRunner,
} from '../transactions.js';

// For tests. A Map has no row locks and no rollback, so this fake gives the
// one guarantee the services rely on in a simple way: transactions run one
// after another, never interleaved. (PostgreSQL is finer: only transactions
// that lock the same row wait for each other.)
export class InMemoryTransactionRunner implements TransactionRunner {
  // The end of the queue: the transaction that is running or ran last.
  private tail: Promise<unknown> = Promise.resolve();

  constructor(private readonly repositories: TransactionalRepositories) {}

  async run<T>(
    work: (repositories: TransactionalRepositories) => Promise<T>
  ): Promise<T> {
    const result = this.tail.then(async () => await work(this.repositories));
    // A failed transaction must not block the ones queued behind it.
    this.tail = result.catch(() => undefined);
    return await result;
  }
}
