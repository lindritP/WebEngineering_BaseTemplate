import type { ReactElement } from 'react';
import { Link } from 'react-router';
import SearchForm from './SearchForm.tsx';

interface NavbarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

export default function Navbar({
  searchTerm,
  onSearch,
}: NavbarProps): ReactElement {
  return (
    <div className="header">
      <h1 className="heading-xl">Welcome to our wildlife website</h1>

      <div className="nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <a href="#">Our team</a>
          </li>
          <li>
            <a href="#">Projects</a>
          </li>
          <li>
            <a href="#">Blog</a>
          </li>
        </ul>
        {/* The key resets the draft input whenever the term in the URL changes
            (back/forward, Home link), so the input never shows a stale term. */}
        <SearchForm
          key={searchTerm}
          initialTerm={searchTerm}
          onSearch={onSearch}
        />
      </div>
    </div>
  );
}
