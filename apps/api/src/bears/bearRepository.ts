import type { Bear } from './bear.js';

// What the routes need from "the place that stores bears". The routes know only
// this interface; whether the bears live in PostgreSQL or in memory is decided
// once, where the app is assembled.
export interface BearRepository {
  // All bears, sorted by name.
  list: () => Promise<Bear[]>;
  // undefined when there is no such bear: whether that is an error (404) is the
  // caller's decision, not the storage's.
  findById: (id: string) => Promise<Bear | undefined>;
}
