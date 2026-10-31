import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { fetchBearData } from '../api/fetching.ts';
import Highlight from '../search/Highlight.tsx';
import type { BearsState } from '../types.ts';
import BearCard from './BearCard.tsx';

interface MoreBearsProps {
  searchTerm: string;
}

export default function MoreBears({
  searchTerm,
}: MoreBearsProps): ReactElement {
  const [state, setState] = useState<BearsState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    fetchBearData(controller.signal)
      .then((bears) => {
        const [firstBear] = bears;
        setState(
          firstBear === undefined
            ? { status: 'empty' }
            : { status: 'success', bears }
        );
      })
      .catch((error: unknown) => {
        // A cancelled request is not an error: the result is irrelevant now.
        if (controller.signal.aborted) {
          return;
        }
        console.error('Fehler beim Abrufen der Bäreninformationen:', error);
        setState({
          status: 'error',
          message:
            'Fehler beim Abrufen der Bäreninformationen. Bitte versuchen Sie es später erneut.',
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="more_bears">
      <h3 className="heading-md">
        <Highlight text="More Bears" query={searchTerm} />
      </h3>
      {state.status === 'loading' && <p>Loading bears…</p>}
      {state.status === 'empty' && <p>No bears found.</p>}
      {state.status === 'error' && <p>{state.message}</p>}
      {state.status === 'success' &&
        state.bears.map((bear) => (
          <BearCard key={bear.binomial} bear={bear} searchTerm={searchTerm} />
        ))}
    </section>
  );
}
