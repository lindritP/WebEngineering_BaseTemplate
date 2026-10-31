export interface BearRow {
  name: string;
  binomial: string;
  imageTitle: string | null;
  range: string;
}

const NAME = /\|name=\[\[(?<value>[^\]]*)\]\]/v;
const BINOMIAL = /\|binomial=(?<value>[^\|\n]*)/v;
const IMAGE = /\|image=(?<value>[^\|\n]*)/v;
const RANGE = /\|range=(?<value>[^\|\n]*)/v;

// Pure: wikitext in, rows out. No network, so it is easy to test.
export function parseBearRows(wikitext: string): BearRow[] {
  return wikitext.split('{{Species table/row').flatMap((row) => {
    const bear = parseRow(row);
    return bear === null ? [] : [bear];
  });
}

function parseRow(row: string): BearRow | null {
  const name = capture(NAME, row);
  const binomial = capture(BINOMIAL, row);
  // Text before the first row (the section intro) has neither field.
  if (name === undefined || binomial === undefined) {
    return null;
  }
  return {
    name,
    binomial,
    imageTitle: capture(IMAGE, row) ?? null,
    range: capture(RANGE, row) ?? 'no range info',
  };
}

function capture(pattern: RegExp, text: string): string | undefined {
  const value = pattern.exec(text)?.groups?.value?.trim();
  return value === '' ? undefined : value;
}

// "U. arctos" -> "u-arctos": stable, URL-safe id derived from the data itself.
export function toSlug(binomial: string): string {
  return binomial
    .toLowerCase()
    .replace(/[^a-z0-9]+/gv, '-')
    .replace(/^-|-$/gv, '');
}
