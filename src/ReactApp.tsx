import React, { useState } from 'react';

export const App: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <span style={{ fontSize: '1.75rem' }}></span>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-header)' }}>
              React + TypeScript Entry Point
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Exercise 3 &bull; Demo 6 Migration Coexistence
            </p>
          </div>
        </div>

        <p style={{ lineHeight: '1.6', color: 'var(--color-text)' }}>
          This root <code>&lt;App /&gt;</code> component is compiled via <strong>Vite</strong> and{' '}
          <strong>TypeScript</strong> and mounted into <code>#react-root</code>
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'var(--color-bg)',
            borderRadius: '6px',
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCount((prev) => prev + 1)}
          >
            Interactive React State: Clicked {count} times
          </button>

        </div>

        <div
          style={{
            marginTop: '1.5rem',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              window.location.hash = 'dashboard';
            }}
          >
            &larr; Return to Vanilla Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
