import { useEffect, useState } from 'react';
import { fetchBears } from '../api/bears.ts';
import { errorMessage } from '../api/problem.ts';
import type { BearsState } from '../types.ts';

// Synchronizes the component with the Bear API. The AbortController
// cancels the request when the owner unmounts (and during StrictMode's dev-only
// remount), so a stale response can never overwrite newer state.
export default function useBears(): BearsState {
  const [state, setState] = useState<BearsState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    fetchBears(controller.signal)
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
          message: errorMessage(
            error,
            'Fehler beim Abrufen der Bäreninformationen. Bitte versuchen Sie es später erneut.'
          ),
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  return state;
}
