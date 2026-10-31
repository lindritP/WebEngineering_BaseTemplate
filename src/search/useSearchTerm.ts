import { useSearchParams } from 'react-router';

const SEARCH_PARAM = 'q';

// The submitted search term is optional view state, so it lives in the URL
// (?q=bear) instead of React state: it survives a reload, can be shared as a
// link and follows the browser's back/forward buttons.
export default function useSearchTerm(): [string, (term: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get(SEARCH_PARAM) ?? '';

  function setSearchTerm(term: string): void {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (term === '') {
        next.delete(SEARCH_PARAM);
      } else {
        next.set(SEARCH_PARAM, term);
      }
      return next;
    });
  }

  return [searchTerm, setSearchTerm];
}
