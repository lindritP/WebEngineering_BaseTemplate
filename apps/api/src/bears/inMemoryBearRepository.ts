import type { Bear } from './bear.js';
import type { BearRepository } from './bearRepository.js';

// For tests: the same contract as the database version, without a database.
export class InMemoryBearRepository implements BearRepository {
  constructor(private readonly bears: readonly Bear[] = []) {}

  // Nothing here waits for anything: the methods are async only so that they
  // have the same signature as the database version.
  async list(): Promise<Bear[]> {
    return await Promise.resolve(
      [...this.bears].sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async findById(id: string): Promise<Bear | undefined> {
    return await Promise.resolve(this.bears.find((bear) => bear.id === id));
  }
}
