import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ReactApp';

const container = document.getElementById('react-root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.warn('React root container #react-root not found in document.');
}
