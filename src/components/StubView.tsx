import React from 'react';
import { ViewKey } from '../types/navigation';

interface StubViewProps {
  viewId: ViewKey;
  title: string;
  description: string;
  icon: string;
  onOpenInVanilla: (view: string) => void;
}

export const StubView: React.FC<StubViewProps> = ({
  viewId,
  title,
  description,
  icon,
  onOpenInVanilla,
}) => {
  return (
    <div className="card" style={{ maxWidth: '900px', margin: '1.5rem auto', padding: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <span style={{ fontSize: '2.2rem' }}>{icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-warn)',
                background: 'rgba(183, 121, 31, 0.12)',
                border: '1px solid var(--color-warn)',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              Migration Stub
            </span>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)' }}>{description}</p>
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-bg)',
          borderRadius: '6px',
          padding: '1.25rem',
          borderLeft: '4px solid var(--color-accent)',
          marginBottom: '1.5rem',
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-header)' }}>
          Component Hierarchy &amp; Migration Status
        </h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
          This view is wired into the React routing skeleton for <strong>Demo 9</strong>. Its
          component hierarchy was specified in <strong>Demo 7</strong> and will be migrated in
          subsequent exercises. Navigating to this view updates the React application state and URL
          hash without destroying the persistent shell.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={() => onOpenInVanilla(viewId)}>
          Inspect Legacy {title} in Vanilla JS &rarr;
        </button>
      </div>
    </div>
  );
};
