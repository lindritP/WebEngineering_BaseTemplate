import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router';
import Highlight from '../search/Highlight.tsx';
import type Bear from '../types.ts';
import { getBearId } from './bearId.ts';

interface BearCardProps {
  bear: Bear;
  searchTerm: string;
}

export default function BearCard({
  bear,
  searchTerm,
}: BearCardProps): ReactElement {
  // Keep the current query string (?q=...) when opening the detail route.
  const { search } = useLocation();

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
          <Link to={{ pathname: `/bears/${getBearId(bear)}`, search }}>
            <Highlight text={bear.name} query={searchTerm} />
          </Link>
        </b>{' '}
        (<Highlight text={bear.binomial} query={searchTerm} />)
      </p>
      <p>
        Range: <Highlight text={bear.range} query={searchTerm} />
      </p>
    </div>
  );
}
