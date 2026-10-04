import { useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';

interface SearchFormProps {
  onSearch: (term: string) => void;
}

export default function SearchForm({
  onSearch,
}: SearchFormProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  function handleSubmit(e: SubmitEvent<HTMLFormElement>): void {
    e.preventDefault();
    onSearch(searchQuery.trim());
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        type="search"
        name="q"
        placeholder="Search query"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
      />
      <input type="submit" value="Go!" />
    </form>
  );
}
