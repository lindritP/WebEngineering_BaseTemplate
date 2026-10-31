import { useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';

interface SearchFormProps {
  initialTerm: string;
  onSearch: (term: string) => void;
}

export default function SearchForm({
  initialTerm,
  onSearch,
}: SearchFormProps): ReactElement {
  // Draft value while typing; the submitted term lives in the URL.
  const [searchQuery, setSearchQuery] = useState(initialTerm);

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
