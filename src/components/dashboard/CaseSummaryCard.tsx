import React from 'react';
import type { CaseData } from '../../types.js';

interface CaseSummaryCardProps {
  caseData: Partial<CaseData>;
}

export const CaseSummaryCard: React.FC<CaseSummaryCardProps> = ({ caseData }) => {
  const status = (caseData.status || 'unknown').toUpperCase();

  return (
    <div className="case-summary-card">
      <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-header)' }}>
        {caseData.title || 'Case'}
      </h3>
      <p style={{ margin: '0 0 0.75rem 0' }}>
        <span className="badge badge-flagged">{status}</span>
      </p>
      <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--color-text)' }}>
        {caseData.summary || ''}
      </p>
    </div>
  );
};
