import { useState, type ReactElement } from 'react';
import BearArticle from './bears/BearArticle.tsx';
import Navbar from './layout/Navbar.tsx';
import Footer from './layout/Footer.tsx';
import RelatedSidebar from './layout/RelatedSidebar.tsx';

export default function App(): ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <>
      <Navbar onSearch={setSearchTerm} />
      <main>
        <BearArticle searchTerm={searchTerm} />
        <RelatedSidebar />
      </main>
      <Footer />
    </>
  );
}
