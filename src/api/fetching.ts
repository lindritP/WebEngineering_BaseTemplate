import type Bear from '../types.js';
import { isWikiError, isWikiParseResponse, getImageUrl } from './wikipedia.js';

// Fetching bear data
const baseUrl = 'https://en.wikipedia.org/w/api.php';
const title = 'List_of_ursids';

export async function fetchBearData(): Promise<void> {
  const params = {
    action: 'parse',
    page: title,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*',
  };

  const wikiBearUrl = `${baseUrl}?${new URLSearchParams(params).toString()}`;

  try {
    const res = await fetch(wikiBearUrl);
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
      await extractBears(data.parse.wikitext['*']);
      return;
    }

    throw new Error('Unerwartetes Antwortformat von Wikipedia');
  } catch (error) {
    console.error('Fehler beim Abrufen der Bäreninformationen:', error);
    const errorParagraph = document.createElement('p');
    errorParagraph.textContent =
      'Fehler beim Abrufen der Bäreninformationen. Bitte versuchen Sie es später erneut.';

    const moreBearsTitle = document.querySelector('.more_bears');
    if (moreBearsTitle !== null) {
      moreBearsTitle.appendChild(errorParagraph);
    }
  }
}

async function fetchImageUrl(fileName: string): Promise<string> {
  const imageParams = {
    action: 'query',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
    origin: '*',
  };

  const wikiBearImageUrl = `${baseUrl}?${new URLSearchParams(imageParams).toString()}`;

  const placeholderImageUrl = 'media/placeholder-bear.png'; // Placeholder image URL

  try {
    const res = await fetch(wikiBearImageUrl);
    if (!res.ok) {
      throw new Error(`Wikipedia antwortet mit Status ${res.status}`);
    }
    const data: unknown = await res.json();

    if (isWikiError(data)) {
      throw new Error(data.error.info);
    }
    return getImageUrl(data) ?? placeholderImageUrl;
  } catch (error) {
    // console.error('Fehler beim Abrufen der Bärenbild-URL:', error);
    return placeholderImageUrl;
  }
}

async function extractBears(wikitext: string): Promise<Bear[]> {
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

        const bearPromise = fetchImageUrl(fileName).then(function (imageUrl) {
          const bear: Bear = {
            name,
            binomial,
            image: imageUrl,
            range: rangeMatch?.groups?.range?.trim() ?? 'no range info',
          };
          return bear;
        });
        bearPromises.push(bearPromise);
      }
    });
  });

  const bears = await Promise.all(bearPromises);
  const moreBears = document.querySelector('.more_bears');
  if (moreBears === null) {
    console.error('Container .more_bears not found');
    return bears;
  }

  bears.forEach(function (bear) {
    const html =
      `<div class="bear">` +
      `<img src="${bear.image}" alt="Image of ${bear.name}" style="width:200px; height:auto;">` +
      `<p><b>${bear.name}</b> (${bear.binomial})</p>` +
      `<p>Range: ${bear.range}</p>` +
      `</div>`;
    moreBears.innerHTML += html;
  });
  return bears;
}
