// Loaded before every test file (see the "test" script). config.ts validates
// the environment when it is imported and DATABASE_URL is required, so the
// tests get a placeholder. Nothing connects to it: the tests use in-memory
// repositories and the connection pool is never created.
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
