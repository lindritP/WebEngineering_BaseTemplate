import { DrizzleCommentRepository } from '../comments/drizzleCommentRepository.js';
import type {
  TransactionalRepositories,
  TransactionRunner,
} from '../transactions.js';
import type { Database } from './client.js';

export class DrizzleTransactionRunner implements TransactionRunner {
  constructor(private readonly db: Database) {}

  // BEGIN, run the work on ONE pooled connection, COMMIT (or ROLLBACK when the
  // work throws). The repositories handed to `work` are bound to that
  // connection: queries through the pool would run on other connections,
  // outside the transaction.
  async run<T>(
    work: (repositories: TransactionalRepositories) => Promise<T>
  ): Promise<T> {
    return await this.db.transaction(async (tx) => {
      return await work({ comments: new DrizzleCommentRepository(tx) });
    });
  }
}
