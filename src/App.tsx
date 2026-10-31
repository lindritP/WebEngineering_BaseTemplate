import type { ReactElement } from 'react';
import { Route, Routes } from 'react-router';
import useBears from './bears/useBears.ts';
import Layout from './layout/Layout.tsx';
import BearDetailPage from './pages/BearDetailPage.tsx';
import HomePage from './pages/HomePage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

export default function App(): ReactElement {
  // App is the closest common owner of the list and the detail route, so the
  // bears are loaded once here and not again on every navigation.
  const bears = useBears();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage bears={bears} />} />
        <Route
          path="bears/:bearId"
          element={<BearDetailPage bears={bears} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
