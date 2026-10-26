import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ReactApp';

// Default to react/dashboard if no hash is specified, ensuring HashRouter basename matches
const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
if (!rawHash) {
  window.location.replace('#/react/dashboard');
}

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
