import React from 'react';

interface NotFoundViewProps {
  attemptedRoute: string;
  onNavigateHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ attemptedRoute, onNavigateHome }) => {
  return (
    <div
      className="card"
      style={{
        maxWidth: '700px',
        margin: '2rem auto',
        padding: '2.5rem',
        textAlign: 'center',
        borderTop: '4px solid var(--color-critical)',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
      <h2 style={{ color: 'var(--color-critical)', marginBottom: '0.5rem' }}>
        404 &mdash; View Not Found
      </h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
        The requested route{' '}
        <code
          style={{
            background: 'var(--color-bg)',
            padding: '2px 8px',
            borderRadius: '4px',
            color: 'var(--color-text)',
            fontWeight: 600,
          }}
        >
          {attemptedRoute}
        </code>{' '}
        does not match any recognized application view.
      </p>

      <div
        style={{
          textAlign: 'left',
          background: 'var(--color-bg)',
          padding: '1rem 1.25rem',
          borderRadius: '6px',
          fontSize: '0.88rem',
          marginBottom: '1.5rem',
          lineHeight: '1.6',
        }}
      >
        <strong style={{ color: 'var(--color-header)' }}>Architectural Comparison (Demo 9):</strong>
        <p style={{ margin: '0.35rem 0 0 0', color: 'var(--color-text)' }}>
          Unlike the legacy Vanilla app (which silently fell back to <code>dashboard</code> when an
          invalid route was entered), this React routing skeleton explicitly detects unrecognized
          routes and renders an informative fallback view. This prevents user confusion, immediately
          surfaces broken links, and avoids silent state drift.
        </p>
      </div>

      <button type="button" className="btn btn-primary" onClick={onNavigateHome}>
        Return to Dashboard
      </button>
    </div>
  );
};
