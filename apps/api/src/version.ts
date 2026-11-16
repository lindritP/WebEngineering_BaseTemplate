import { readFileSync } from 'node:fs';

function readVersion(): string {
  const pkg: unknown = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  );
  if (
    typeof pkg === 'object' &&
    pkg !== null &&
    'version' in pkg &&
    typeof pkg.version === 'string'
  ) {
    return pkg.version;
  }
  return 'unknown';
}

// Read once at startup; used by /health and the OpenAPI document.
export const API_VERSION = readVersion();
