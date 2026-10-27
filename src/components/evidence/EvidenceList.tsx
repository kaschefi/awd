import React from 'react';
import type { Evidence } from '../../types.js';
import { EvidenceCard } from './EvidenceCard.js';

export interface EvidenceListProps {
  evidence: Evidence[];
  bookmarks?: string[];
  isLoading?: boolean;
  onToggleBookmark?: (id: string) => void;
  onSelectEvidence?: (id: string) => void;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  evidence,
  bookmarks,
  isLoading = false,
  onToggleBookmark,
  onSelectEvidence,
}) => {
  if (isLoading) {
    return (
      <div id="evidenceLoadingIndicator" className="evidence-loading" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
        <p>Loading evidence…</p>
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>No evidence matches the current filters.</p>
      </div>
    );
  }

  return (
    <div id="evidenceList" className="evidence-grid">
      {evidence.map((item) => (
        <EvidenceCard
          key={item.id}
          evidence={item}
          isBookmarked={bookmarks ? bookmarks.indexOf(item.id) !== -1 : undefined}
          onToggleBookmark={onToggleBookmark}
          onSelectEvidence={onSelectEvidence}
        />
      ))}
    </div>
  );
};
