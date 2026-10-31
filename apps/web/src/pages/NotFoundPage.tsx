import type { ReactElement } from 'react';
import { Link } from 'react-router';

// Fallback route: "*"
export default function NotFoundPage(): ReactElement {
  return (
    <article>
      <title>Page not found – Wildlife Website</title>
      <h2 className="heading-lg">Page not found</h2>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </article>
  );
}
