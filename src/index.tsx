// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { HostProvider } from './context/HostContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <HostProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HostProvider>
    </React.StrictMode>
  );
}
