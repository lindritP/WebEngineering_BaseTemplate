import { config } from '../config.js';
import { UpstreamError, UpstreamTimeoutError } from '../errors.js';

const USER_AGENT =
  'BearsBFF/1.0 (https://github.com/lindritP/WebEngineering_BaseTemplate)';

export async function fetchWikipedia(
  params: Record<string, string>
): Promise<unknown> {
  const query = new URLSearchParams({
    ...params,
    format: 'json',
    formatversion: '2',
  });

  try {
    const res = await fetch(`${config.wikipediaApiUrl}?${query.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });
    if (!res.ok) {
      throw new UpstreamError(`Wikipedia answered with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    if (error instanceof UpstreamError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new UpstreamTimeoutError('Wikipedia did not answer in time', {
        cause: error,
      });
    }
    throw new UpstreamError('Request to Wikipedia failed', { cause: error });
  }
}
