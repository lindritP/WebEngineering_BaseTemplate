import type { CommentRepository } from './comments/commentRepository.js';

// The repositories as they behave inside one transaction: everything they do
// belongs to that transaction and is committed or rolled back together.
export interface TransactionalRepositories {
  comments: CommentRepository;
}

// What a service needs to run several steps as one transaction. The service
// decides WHAT belongs together (it knows the business rule); the repositories
// only know how to read and write. So the boundary lives here, in the
// service's call to run(), never inside a repository method.
//
// If `work` throws, everything it did is rolled back and the error is rethrown.
export interface TransactionRunner {
  run: <T>(
    work: (repositories: TransactionalRepositories) => Promise<T>
  ) => Promise<T>;
}
