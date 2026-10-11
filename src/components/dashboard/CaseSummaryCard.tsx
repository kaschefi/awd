import React from 'react';
import type { CaseData } from '../../types.js';
import { Card } from '../common/Card.js';
import { Badge } from '../common/Badge.js';

interface CaseSummaryCardProps {
  caseData: Partial<CaseData>;
}

export const CaseSummaryCard: React.FC<CaseSummaryCardProps> = ({ caseData }) => {
  const status = (caseData.status || 'unknown').toUpperCase();

  return (
    <Card className="case-summary-card">
      <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-header)' }}>
        {caseData.title || 'Case'}
      </h3>
      <p style={{ margin: '0 0 0.75rem 0' }}>
        <Badge variant="flagged">{status}</Badge>
      </p>
      <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--color-text)' }}>
        {caseData.summary || ''}
      </p>
    </Card>
  );
};

