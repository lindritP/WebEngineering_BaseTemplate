import { useId, useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';

interface SearchFormProps {
  initialTerm: string;
  onSearch: (term: string) => void;
}

export default function SearchForm({
  initialTerm,
  onSearch,
}: SearchFormProps): ReactElement {
  const inputId = useId();
  // Draft value while typing; the submitted term lives in the URL.
  const [searchQuery, setSearchQuery] = useState(initialTerm);
  const [syncedTerm, setSyncedTerm] = useState(initialTerm);

  // When the term in the URL changes from outside (back/forward, Home link),
  // restart the draft from it. This is done during render instead of
  // remounting the form, so keyboard focus is not lost after a search.
  if (initialTerm !== syncedTerm) {
    setSyncedTerm(initialTerm);
    setSearchQuery(initialTerm);
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>): void {
    e.preventDefault();
    onSearch(searchQuery.trim());
  }

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      {/* Label only for screen readers: a visible one would clutter the nav */}
      <label htmlFor={inputId} className="visually-hidden">
        Search the article
      </label>
      <input
        id={inputId}
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
