import type Bear from '../types.js';
import { isWikiError, isWikiParseResponse, getImageUrl } from './wikipedia.js';

// Fetching bear data
const baseUrl = 'https://en.wikipedia.org/w/api.php';
const title = 'List_of_ursids';

export async function fetchBearData(signal?: AbortSignal): Promise<Bear[]> {
  const params = {
    action: 'parse',
    page: title,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*',
  };

  const wikiBearUrl = `${baseUrl}?${new URLSearchParams(params).toString()}`;

  const res = await fetch(wikiBearUrl, { signal });
  if (!res.ok) {
    throw new Error(`Wikipedia antwortet mit Status ${res.status}`);
  }
  const data: unknown = await res.json();

  // Wenn data ein error ist, dann enthält es error drinnen
  if (isWikiError(data)) {
    throw new Error(data.error.info);
  }

  // wenn data dann die richtige antwort gibt erwarten wir dass data da ist und data.parse und data.parse.wikitext und data.parse.wikitext["*"] ein string ist
  if (isWikiParseResponse(data)) {
    return await extractBears(data.parse.wikitext['*'], signal);
  }

  throw new Error('Unerwartetes Antwortformat von Wikipedia');
}

async function fetchImageUrl(
  fileName: string,
  signal?: AbortSignal
): Promise<string> {
  const imageParams = {
    action: 'query',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
    origin: '*',
  };

  const wikiBearImageUrl = `${baseUrl}?${new URLSearchParams(imageParams).toString()}`;

  const placeholderImageUrl = '/media/placeholder-bear.png'; // Placeholder image URL

  try {
    const res = await fetch(wikiBearImageUrl, { signal });
    if (!res.ok) {
      throw new Error(`Wikipedia antwortet mit Status ${res.status}`);
    }
    const data: unknown = await res.json();

    if (isWikiError(data)) {
      throw new Error(data.error.info);
    }
    return getImageUrl(data) ?? placeholderImageUrl;
  } catch (error) {
    // A cancelled request is not a missing image: let the caller see it.
    if (signal?.aborted === true) {
      throw error;
    }
    return placeholderImageUrl;
  }
}

async function extractBears(
  wikitext: string,
  signal?: AbortSignal
): Promise<Bear[]> {
  const speciesTables = wikitext.split('{{Species table/end}}');
  const bearPromises: Array<Promise<Bear>> = [];

  speciesTables.forEach(function (table) {
    const rows = table.split('{{Species table/row');
    rows.forEach(function (row) {
      const nameMatch = /\|name=\[\[(?<name>.*?)\]\]/v.exec(row);
      const binomialMatch = /\|binomial=(?<binomial>.*?)\n/v.exec(row);
      const imageMatch = /\|image=(?<image>.*?)\n/v.exec(row);
      const rangeMatch = /\|range=(?<range>[^\|\n]*)/v.exec(row);

      const name = nameMatch?.groups?.name;
      const binomial = binomialMatch?.groups?.binomial;
      const image = imageMatch?.groups?.image;

      if (name !== undefined && binomial !== undefined && image !== undefined) {
        const fileName = image.trim().replace('File:', '');

        const bearPromise = fetchImageUrl(fileName, signal).then(
          function (imageUrl) {
            const bear: Bear = {
              name,
              binomial,
              image: imageUrl,
              range: rangeMatch?.groups?.range?.trim() ?? 'no range info',
            };
            return bear;
          }
        );
        bearPromises.push(bearPromise);
      }
    });
  });

  return await Promise.all(bearPromises);
}
