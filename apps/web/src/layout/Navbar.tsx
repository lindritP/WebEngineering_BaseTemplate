import type { ReactElement } from 'react';
import { NavLink } from 'react-router';
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
    <header className="header">
      <h1 className="heading-xl">Welcome to our wildlife website</h1>

      <nav className="nav" aria-label="Main">
        <ul>
          <li>
            {/* NavLink sets aria-current="page" on the active route */}
            <NavLink to="/" end>
              Home
            </NavLink>
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
        <SearchForm initialTerm={searchTerm} onSearch={onSearch} />
      </nav>
    </header>
  );
}
