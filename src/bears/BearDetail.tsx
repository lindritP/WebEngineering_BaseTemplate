import type { ReactElement } from 'react';
import Highlight from '../search/Highlight.tsx';
import type Bear from '../types.ts';

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
      <h2 className="heading-lg">
        <Highlight text={bear.name} query={searchTerm} />
      </h2>
      <img
        src={bear.image}
        alt={`Image of ${bear.name}`}
        style={{ width: '400px', maxWidth: '100%', height: 'auto' }}
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
          Read more on Wikipedia
        </a>
      </p>
    </>
  );
}
