import type { ReactElement } from 'react';

const relatedTitles = [
  'The trouble with Bees',
  'The trouble with Otters',
  'The trouble with Penguins',
  'The trouble with Octopi',
  'The trouble with Lemurs',
];

export default function RelatedSidebar(): ReactElement {
  return (
    <div className="secondary">
      <h2 className="heading-lg">Related</h2>
      <ul>
        {relatedTitles.map((title) => (
          <li key={title}>
            <a href="#">{title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
