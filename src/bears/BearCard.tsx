import type { ReactElement } from 'react';
import Highlight from '../search/Highlight.tsx';
import type Bear from '../types.ts';

interface BearCardProps {
  bear: Bear;
  searchTerm: string;
}

export default function BearCard({
  bear,
  searchTerm,
}: BearCardProps): ReactElement {
  return (
    <div
      className="bear"
      style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}
    >
      <img
        src={bear.image}
        alt={`Image of ${bear.name}`}
        style={{ width: '200px', height: 'auto' }}
      ></img>
      <p>
        <b>
          <Highlight text={bear.name} query={searchTerm} />
        </b>{' '}
        (<Highlight text={bear.binomial} query={searchTerm} />)
      </p>
      <p>
        Range: <Highlight text={bear.range} query={searchTerm} />
      </p>
    </div>
  );
}
