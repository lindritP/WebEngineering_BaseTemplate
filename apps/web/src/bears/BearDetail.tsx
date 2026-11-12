import type { ReactElement } from 'react';
import ToggleComments from '../layout/comments/ToggleComments.tsx';
import Highlight from '../search/Highlight.tsx';
import type Bear from '../types.ts';
import BearImage from './BearImage.tsx';

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
      <BearImage bear={bear} className="bear-detail-image" />
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
      {/* Comments belong to one bear. The key gives every bear a fresh
          comment section, so nothing (open panel, half-typed text, loaded
          list) leaks over when navigating from one bear to the next. */}
      <ToggleComments key={bear.id} bearId={bear.id} />
    </>
  );
}
