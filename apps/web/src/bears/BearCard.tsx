import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router';
import Highlight from '../search/Highlight.tsx';
import type Bear from '../types.ts';
import { getBearId } from './bearId.ts';
import { getBearImageAlt } from './bearImageAlt.ts';

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

  // The name is a heading, so screen reader users can jump from bear to bear.
  return (
    <li className="bear">
      <h4>
        <Link to={{ pathname: `/bears/${getBearId(bear)}`, search }}>
          <Highlight text={bear.name} query={searchTerm} />
        </Link>
      </h4>
      <img src={bear.image} alt={getBearImageAlt(bear)} />
      <p>
        Scientific name:{' '}
        <i>
          <Highlight text={bear.binomial} query={searchTerm} />
        </i>
      </p>
      <p>
        Range: <Highlight text={bear.range} query={searchTerm} />
      </p>
    </li>
  );
}
