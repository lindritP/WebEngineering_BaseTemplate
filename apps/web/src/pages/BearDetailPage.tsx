import type { ReactElement } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import BearDetail from '../bears/BearDetail.tsx';
import { getBearId } from '../bears/bearId.ts';
import useSearchTerm from '../search/useSearchTerm.ts';
import type { BearsState } from '../types.ts';

interface BearDetailPageProps {
  bears: BearsState;
}

// Detail route: "/bears/:bearId"
export default function BearDetailPage({
  bears,
}: BearDetailPageProps): ReactElement {
  const { bearId } = useParams();
  const [searchTerm] = useSearchTerm();
  // Keep the current query string (?q=...) when going back to the list.
  const { search } = useLocation();

  return (
    <article>
      <p>
        <Link to={{ pathname: '/', search }}>
          {/* The arrow is decoration; screen readers would read "left arrow" */}
          <span aria-hidden="true">← </span>Back to all bears
        </Link>
      </p>
      <BearDetailContent
        bears={bears}
        bearId={bearId}
        searchTerm={searchTerm}
      />
    </article>
  );
}

interface BearDetailContentProps {
  bears: BearsState;
  bearId: string | undefined;
  searchTerm: string;
}

function BearDetailContent({
  bears,
  bearId,
  searchTerm,
}: BearDetailContentProps): ReactElement {
  if (bears.status === 'loading') {
    return (
      <>
        <title>Loading bear – Wildlife Website</title>
        <p role="status">Loading bear…</p>
      </>
    );
  }
  if (bears.status === 'error') {
    return (
      <>
        <title>Error – Wildlife Website</title>
        <p role="alert">{bears.message}</p>
      </>
    );
  }

  // Derived from the loaded list and the route parameter, not stored as state.
  const bear =
    bears.status === 'success'
      ? bears.bears.find((candidate) => getBearId(candidate) === bearId)
      : undefined;

  if (bear === undefined) {
    return (
      <>
        <title>Bear not found – Wildlife Website</title>
        <h2 className="heading-lg">Bear not found</h2>
        <p>No bear with the id &quot;{bearId}&quot; was found.</p>
      </>
    );
  }

  return <BearDetail bear={bear} searchTerm={searchTerm} />;
}
