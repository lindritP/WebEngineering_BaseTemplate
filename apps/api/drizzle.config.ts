import { defineConfig } from 'drizzle-kit';

// Used by the drizzle-kit CLI only (not part of the compiled API).
// `generate` compares the schema with the last snapshot in ./drizzle and writes
// the difference as a SQL migration. It needs no database connection.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
});
