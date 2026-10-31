import { UpstreamError } from '../errors.js';
import { fetchWikipedia } from '../wikipedia/client.js';
import {
  ImageInfoResponseSchema,
  ParseResponseSchema,
} from '../wikipedia/schema.js';
import type { Bear } from './bear.js';
import { parseBearRows, toSlug } from './parseBears.js';

export async function fetchBears(): Promise<Bear[]> {
  const parsed = ParseResponseSchema.safeParse(
    await fetchWikipedia({
      action: 'parse',
      page: 'List_of_ursids',
      prop: 'wikitext',
      section: '3',
    })
  );
  if (!parsed.success) {
    throw new UpstreamError('Unexpected response from Wikipedia');
  }

  const rows = parseBearRows(parsed.data.parse.wikitext);
  // No rows means the page changed, not that there are no bears.
  const [firstRow] = rows;
  if (firstRow === undefined) {
    throw new UpstreamError('No bears found on the Wikipedia page');
  }

  const imageUrls = await fetchImageUrls(
    rows.flatMap((row) => (row.imageTitle === null ? [] : [row.imageTitle]))
  );

  return rows.map((row) => ({
    id: toSlug(row.binomial),
    name: row.name,
    binomial: row.binomial,
    imageUrl:
      row.imageTitle === null ? null : (imageUrls.get(row.imageTitle) ?? null),
    range: row.range,
  }));
}

// One request for all images instead of one per bear ("titles" takes up to
// 50 titles separated by "|"). Returns requested title -> image URL.
async function fetchImageUrls(titles: string[]): Promise<Map<string, string>> {
  const result = ImageInfoResponseSchema.safeParse(
    await fetchWikipedia({
      action: 'query',
      titles: titles.join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
    })
  );
  if (!result.success) {
    throw new UpstreamError('Unexpected image response from Wikipedia');
  }

  const {
    data: {
      query: { normalized = [], pages },
    },
  } = result;
  // Wikipedia may rewrite a title (e.g. "_" -> " "); map ours to its version.
  const normalizedTitles = new Map(normalized.map((n) => [n.from, n.to]));
  const urlByTitle = new Map<string, string>();
  for (const page of pages) {
    const [info] = page.imageinfo ?? [];
    if (info !== undefined) {
      urlByTitle.set(page.title, info.url);
    }
  }

  const urls = new Map<string, string>();
  for (const title of titles) {
    const url = urlByTitle.get(normalizedTitles.get(title) ?? title);
    if (url !== undefined) {
      urls.set(title, url);
    }
  }
  return urls;
}
