import React from 'react';
import type { TimelineEvent } from '../../types.js';
import { formatDate } from '../../utils.js';

interface RecentTimelineListProps {
  timeline: TimelineEvent[];
}

export const RecentTimelineList: React.FC<RecentTimelineListProps> = ({ timeline }) => {
  const recent = timeline.slice(-5).reverse();

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
        <h3 style={{ margin: 0 }}>Recent timeline events</h3>
      </div>

      {recent.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          No timeline events loaded yet.
        </p>
      ) : (
        recent.map((evt) => (
          <div key={evt.id} className="mini-list-item">
            <strong>{formatDate(evt.time)}</strong>
            <br />
            {evt.title}
          </div>
        ))
      )}
    </div>
  );
};
