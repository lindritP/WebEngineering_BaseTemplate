import type { BearRepository } from './bears/bearRepository.js';
import type { CommentRepository } from './comments/commentRepository.js';
import type { TransactionRunner } from './transactions.js';

// Everything the app needs from the outside world. buildApp() receives it, so
// the same routes run against PostgreSQL in production and against in-memory
// repositories in tests.
export interface AppDependencies {
  bears: BearRepository;
  comments: CommentRepository;
  // Lets a service run several repository calls as one transaction.
  transactions: TransactionRunner;
  // Resolves if the app can serve requests, rejects otherwise (readiness).
  checkReady: () => Promise<void>;
  // Releases what the dependencies hold, e.g. database connections.
  close?: () => Promise<void>;
}
