import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import './style.css';
import App from './App.tsx';

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
