import type { ReactElement } from 'react';
import { buildRegex } from '../search.ts';

// split() puts the captured matches at every second position, starting at 1.
const MATCH_STEP = 2;
const FIRST_MATCH_INDEX = 1;

interface HighlightProps {
  text: string;
  query: string;
}

export default function Highlight({
  text,
  query,
}: HighlightProps): ReactElement {
  if (query === '') {
    return <>{text}</>;
  }

  // buildRegex wraps the term in one capture group, so split() keeps the
  // matches in the result.
  const parts = text.split(buildRegex(query));

  return (
    <>
      {parts.map((part, index) =>
        index % MATCH_STEP === FIRST_MATCH_INDEX ? (
          <mark key={index} className="highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
