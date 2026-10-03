import React from 'react';

interface ReviewProgressProps {
  reviewedCount: number;
  totalCount: number;
  progressPct: number;
}

export const ReviewProgress: React.FC<ReviewProgressProps> = ({
  reviewedCount,
  totalCount,
  progressPct,
}) => {
  return (
    <div className="dashboard-panel">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <h3 style={{ margin: 0 }}>Review progress</h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {reviewedCount} of {totalCount} reviewed
        </span>
      </div>

      <div
        className="progress-bar-outer"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar-inner" style={{ width: `${progressPct}%` }} />
      </div>

      <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
        {progressPct}% of evidence reviewed
      </p>
    </div>
  );
};
