import type { ReactElement } from 'react';
import { Outlet } from 'react-router';
import useSearchTerm from '../search/useSearchTerm.ts';
import Footer from './Footer.tsx';
import Navbar from './Navbar.tsx';
import RelatedSidebar from './RelatedSidebar.tsx';

// Shared page frame for every route; the matched route renders in <Outlet />.
export default function Layout(): ReactElement {
  const [searchTerm, setSearchTerm] = useSearchTerm();

  return (
    <>
      <Navbar searchTerm={searchTerm} onSearch={setSearchTerm} />
      <main>
        <Outlet />
        <RelatedSidebar />
      </main>
      <Footer />
    </>
  );
}
