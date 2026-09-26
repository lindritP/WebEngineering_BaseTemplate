import { isObject } from '../helper';

interface WikiErrorResponse {
  error: {
    info: string;
  };
}

interface WikiParseResponse {
  parse: {
    wikitext: { '*': string };
  };
}

export function isWikiError(data: unknown): data is WikiErrorResponse {
  return (
    isObject(data) &&
    isObject(data.error) &&
    typeof data.error.info === 'string'
  );
}

export function isWikiParseResponse(data: unknown): data is WikiParseResponse {
  return (
    isObject(data) &&
    isObject(data.parse) &&
    isObject(data.parse.wikitext) &&
    typeof data.parse.wikitext['*'] === 'string'
  );
}

export function getImageUrl(data: unknown): string | null {
  if (!isObject(data) || !isObject(data.query) || !isObject(data.query.pages)) {
    return null;
  }

  const [page] = Object.values(data.query.pages);

  if (!isObject(page) || !Array.isArray(page.imageinfo)) {
    return null;
  }
  const imageinfo: unknown[] = page.imageinfo;

  const [firstInfo] = imageinfo;
  if (isObject(firstInfo) && typeof firstInfo.url === 'string') {
    return firstInfo.url;
  }

  return null;
}
