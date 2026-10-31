import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router';
import useSearchTerm from '../search/useSearchTerm.ts';
import Footer from './Footer.tsx';
import Navbar from './Navbar.tsx';
import RelatedSidebar from './RelatedSidebar.tsx';

// Shared page frame for every route; the matched route renders in <Outlet />.
export default function Layout(): ReactElement {
  const [searchTerm, setSearchTerm] = useSearchTerm();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);

  // A client-side navigation does not reload the page, so screen readers do
  // not notice it and keyboard focus stays on the clicked link. Moving focus to
  // the new content fixes both (only when the route really changed).
  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }
    previousPathname.current = pathname;
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar searchTerm={searchTerm} onSearch={setSearchTerm} />
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <Outlet />
        <RelatedSidebar />
      </main>
      <Footer />
    </>
  );
}
