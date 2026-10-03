import React from 'react';
import { ViewKey } from '../types/navigation';

interface DashboardStubProps {
  onNavigate: (view: ViewKey) => void;
}

export const DashboardStub: React.FC<DashboardStubProps> = ({ onNavigate }) => {
  return (
    <div>
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius)',
          padding: '1.5rem 1.75rem',
          boxShadow: 'var(--shadow)',
          marginBottom: '1.5rem',
          borderLeft: '4px solid var(--color-accent)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                letterSpacing: '0.05em',
              }}
            >
              Demo 9 &bull; Application Shell Active
            </span>
            <h2 style={{ margin: '0.35rem 0', color: 'var(--color-header)' }}>
              Project ReMotion Investigation Dashboard
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              Autonomous Robotic Arm incident at Neurological Rehabilitation Unit 4.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span
              style={{
                background: 'rgba(26, 127, 75, 0.12)',
                color: 'var(--color-ok)',
                border: '1px solid var(--color-ok)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Shell Mounted
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
      </div>

    </div>
  );
};
