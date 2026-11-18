import { z } from 'zod';

const DEFAULT_PORT = 3000;
const MIN_PORT = 1;
const MAX_PORT = 65_535;
const DEFAULT_WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const DEFAULT_UPSTREAM_TIMEOUT_MS = 5000;
const DEFAULT_POOL_MAX = 10;
const FAILURE_EXIT_CODE = 1;

// process.env only ever holds strings (or nothing), so every variable is
// parsed here: "5000" -> 5000, "true" -> true, "a, b" -> ['a', 'b'].

// z.coerce.boolean() would turn the string "false" into true (any non-empty
// string is truthy), so booleans are spelled out explicitly.
const BooleanString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

// "http://localhost:4173, https://bears.example" -> two validated origins
const UrlList = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry !== '')
  )
  .pipe(z.array(z.url()));

const EnvSchema = z
  .object({
    PORT: z.coerce
      .number()
      .int()
      .min(MIN_PORT)
      .max(MAX_PORT)
      .default(DEFAULT_PORT),
    // Required, no default: the API is useless without its database.
    DATABASE_URL: z.url({ protocol: /^postgres(?:ql)?$/v }),
    // Hard cap of connections this process may hold open. Keep
    // instances * DB_POOL_MAX below Postgres' max_connections (default 100).
    DB_POOL_MAX: z.coerce.number().int().positive().default(DEFAULT_POOL_MAX),
    WIKIPEDIA_API_URL: z.url().default(DEFAULT_WIKIPEDIA_API_URL),
    UPSTREAM_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_UPSTREAM_TIMEOUT_MS),
    // Off unless explicitly switched on: never reachable in a normal deployment.
    ENABLE_DEBUG_ROUTES: BooleanString.default(false),
    // Browser origins that may call the API directly. Empty by default: the
    // web app reaches the API through a proxy on its own origin.
    CORS_ORIGINS: UrlList.default([]),
  })
  .transform((env) => ({
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    dbPoolMax: env.DB_POOL_MAX,
    wikipediaApiUrl: env.WIKIPEDIA_API_URL,
    upstreamTimeoutMs: env.UPSTREAM_TIMEOUT_MS,
    enableDebugRoutes: env.ENABLE_DEBUG_ROUTES,
    corsOrigins: env.CORS_ORIGINS,
  }));

export type Config = z.output<typeof EnvSchema>;

function loadConfig(env: NodeJS.ProcessEnv): Config {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    // Fail fast and loud. Only variable names and rules are printed, never the
    // values: DATABASE_URL contains the database password.
    process.stderr.write(
      `Invalid environment configuration:\n${z.prettifyError(result.error)}\n`
    );
    process.exit(FAILURE_EXIT_CODE);
  }
  return result.data;
}

export const config = loadConfig(process.env);
