import React from 'react';
import type { Evidence } from '../../types.js';
import { getStatusBadgeClass } from '../../utils.js';

interface RecentEvidenceListProps {
  evidence: Evidence[];
}

export const RecentEvidenceList: React.FC<RecentEvidenceListProps> = ({ evidence }) => {
  const recent = evidence.slice(-5).reverse();

  return (
    <div className="dashboard-panel">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <h3 style={{ margin: 0 }}>Recent evidence</h3>
      </div>

      {recent.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          No evidence loaded yet.
        </p>
      ) : (
        recent.map((ev) => (
          <div key={ev.id} className="mini-list-item">
            <strong>{ev.id}</strong> &mdash; {ev.title}{' '}
            <span className={`badge ${getStatusBadgeClass(ev.status)}`}>{ev.status}</span>
          </div>
        ))
      )}
    </div>
  );
};
