import type { ReactElement } from 'react';
import Highlight from '../search/Highlight.tsx';
import type { BearsState } from '../types.ts';
import BearCard from './BearCard.tsx';
import { getBearId } from './bearId.ts';

interface MoreBearsProps {
  bearsState: BearsState;
  searchTerm: string;
}

export default function MoreBears({
  bearsState,
  searchTerm,
}: MoreBearsProps): ReactElement {
  return (
    <section className="more_bears">
      <h3 className="heading-md">
        <Highlight text="More Bears" query={searchTerm} />
      </h3>
      {bearsState.status === 'loading' && <p>Loading bears…</p>}
      {bearsState.status === 'empty' && <p>No bears found.</p>}
      {bearsState.status === 'error' && <p>{bearsState.message}</p>}
      {bearsState.status === 'success' &&
        bearsState.bears.map((bear) => (
          <BearCard key={getBearId(bear)} bear={bear} searchTerm={searchTerm} />
        ))}
    </section>
  );
}
