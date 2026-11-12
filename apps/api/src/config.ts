const DEFAULT_WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const DEFAULT_UPSTREAM_TIMEOUT_MS = 5000;

export const config = {
  wikipediaApiUrl: process.env.WIKIPEDIA_API_URL ?? DEFAULT_WIKIPEDIA_API_URL,
  upstreamTimeoutMs: Number(
    process.env.UPSTREAM_TIMEOUT_MS ?? DEFAULT_UPSTREAM_TIMEOUT_MS
  ),
  // Off unless explicitly switched on: never reachable in a normal deployment.
  enableDebugRoutes: process.env.ENABLE_DEBUG_ROUTES === 'true',
};
