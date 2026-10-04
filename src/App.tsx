import type { ReactElement } from 'react';
import BearArticle from './bears/BearArticle.tsx';
import Navbar from './layout/Navbar.tsx';
import Footer from './layout/Footer.tsx';
import RelatedSidebar from './layout/RelatedSidebar.tsx';

export default function App(): ReactElement {
  return (
    <>
      <Navbar />
      <main>
        <BearArticle />
        <RelatedSidebar />
      </main>
      <Footer />
    </>
  );
}
