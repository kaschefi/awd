import React from 'react';
import { ViewKey } from '../../types/navigation.js';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '2.5rem' }}>{icon}</span>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-header)' }}>{title}</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)' }}>{description}</p>
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-bg)',
          borderLeft: '4px solid var(--color-accent)',
          padding: '1rem 1.25rem',
          borderRadius: '4px',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--color-header)' }}>
          Exercise 4 Migration Scope Note:
        </p>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--color-text)' }}>
          This view is intentionally preserved in the legacy Vanilla JS application for this phase.
          Full React conversion of this view requires interactive state management (such as complex
          filtering, multi-step notes editing, and form validation), which is scheduled for
          Exercise 5.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onOpenInVanilla(viewId)}
        >
          Open in Vanilla App &rarr;
        </button>
      </div>
    </div>
  );
};
