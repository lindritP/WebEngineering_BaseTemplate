import type { ReactElement } from 'react';
import Highlight from '../search/Highlight.tsx';
import type Bear from '../types.ts';
import { getBearImageAlt } from './bearImageAlt.ts';

interface BearDetailProps {
  bear: Bear;
  searchTerm: string;
}

export default function BearDetail({
  bear,
  searchTerm,
}: BearDetailProps): ReactElement {
  const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(bear.name.replaceAll(' ', '_'))}`;

  return (
    <>
      <title>{`${bear.name} – Wildlife Website`}</title>
      <h2 className="heading-lg">
        <Highlight text={bear.name} query={searchTerm} />
      </h2>
      <img
        className="bear-detail-image"
        src={bear.image}
        alt={getBearImageAlt(bear)}
      />
      <p>
        Scientific name:{' '}
        <i>
          <Highlight text={bear.binomial} query={searchTerm} />
        </i>
      </p>
      <p>
        Range: <Highlight text={bear.range} query={searchTerm} />
      </p>
      <p>
        <a href={wikipediaUrl} target="_blank" rel="noreferrer">
          Read more about the {bear.name} on Wikipedia
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </p>
    </>
  );
}
