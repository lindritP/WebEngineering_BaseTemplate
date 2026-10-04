import type { ReactElement } from 'react';
import SearchForm from './SearchForm.tsx';

interface NavbarProps {
  onSearch: (term: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps): ReactElement {
  return (
    <div className="header">
      <h1 className="heading-xl">Welcome to our wildlife website</h1>

      <div className="nav">
        <ul>
          <li>
            <a href="#">Home</a>
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
        <SearchForm onSearch={onSearch} />
      </div>
    </div>
  );
}
