const DEFAULT_WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const DEFAULT_UPSTREAM_TIMEOUT_MS = 5000;

// "http://localhost:4173, https://bears.example" -> ['http://localhost:4173', ...]
function parseList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
}

export const config = {
  wikipediaApiUrl: process.env.WIKIPEDIA_API_URL ?? DEFAULT_WIKIPEDIA_API_URL,
  upstreamTimeoutMs: Number(
    process.env.UPSTREAM_TIMEOUT_MS ?? DEFAULT_UPSTREAM_TIMEOUT_MS
  ),
  // Off unless explicitly switched on: never reachable in a normal deployment.
  enableDebugRoutes: process.env.ENABLE_DEBUG_ROUTES === 'true',
  // Browser origins that may call the API directly. Empty by default: the web
  // app reaches the API through a proxy on its own origin and needs no CORS.
  corsOrigins: parseList(process.env.CORS_ORIGINS),
};
