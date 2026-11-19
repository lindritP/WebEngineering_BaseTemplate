import { describeCommentRepository } from './commentRepository.contract.js';
import { InMemoryCommentRepository } from './inMemoryCommentRepository.js';

describeCommentRepository(
  'InMemoryCommentRepository',
  () => new InMemoryCommentRepository()
);
