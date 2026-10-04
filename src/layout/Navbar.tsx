import type { ReactElement } from 'react';
import SearchForm from './SearchForm.tsx';

export default function Navbar(): ReactElement {
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
        <SearchForm />
      </div>
    </div>
  );
}
