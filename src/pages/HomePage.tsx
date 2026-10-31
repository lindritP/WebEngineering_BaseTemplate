import type { ReactElement } from 'react';
import BearArticle from '../bears/BearArticle.tsx';
import useSearchTerm from '../search/useSearchTerm.ts';
import type { BearsState } from '../types.ts';

interface HomePageProps {
  bears: BearsState;
}

// List route: "/"
export default function HomePage({ bears }: HomePageProps): ReactElement {
  const [searchTerm] = useSearchTerm();

  return (
    <>
      {/* React 19 moves <title> into <head>: every route gets its own title */}
      <title>The trouble with Bears – Wildlife Website</title>
      <BearArticle bears={bears} searchTerm={searchTerm} />
    </>
  );
}
