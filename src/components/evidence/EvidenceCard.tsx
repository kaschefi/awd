import React from 'react';
import type { Evidence } from '../../types.js';
import { formatDate, getStatusBadgeClass, getRelevanceBadgeClass } from '../../formatters.js';
import { useBookmarks } from '../../context/BookmarkContext.js';

export interface EvidenceCardProps {
  evidence: Evidence;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onSelectEvidence?: (id: string) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  isBookmarked: propIsBookmarked,
  onToggleBookmark: propToggleBookmark,
  onSelectEvidence,
}) => {
  const { isBookmarked: contextIsBookmarked, toggleBookmark: contextToggleBookmark } = useBookmarks();
  const isBookmarked = propIsBookmarked ?? contextIsBookmarked(evidence.id);
  const onToggleBookmark = propToggleBookmark ?? contextToggleBookmark;

  const handleBookmarkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Stop propagation so clicking bookmark does not trigger onSelectEvidence on the card
    e.stopPropagation();
    onToggleBookmark(evidence.id);
  };

  const handleCardClick = () => {
    onSelectEvidence?.(evidence.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectEvidence?.(evidence.id);
    }
  };

  return (
    <div
      className="evidence-card"
      data-id={evidence.id}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={{ cursor: onSelectEvidence ? 'pointer' : 'default' }}
    >
      <button
        type="button"
        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
        onClick={handleBookmarkClick}
        aria-label={`Toggle bookmark for ${evidence.title}`}
      >
        <span className="bookmark-icon">{isBookmarked ? '★' : '☆'}</span>
      </button>

      <h3>{evidence.title}</h3>

      <div className="evidence-meta">
        {evidence.id} &middot; {evidence.type} &middot; {formatDate(evidence.timestamp)}
      </div>

      <div className="evidence-summary">{evidence.summary}</div>

      <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {evidence.tags && evidence.tags.includes('critical') && (
          <span className="badge badge-critical">Critical</span>
        )}
        <span className={`badge ${getStatusBadgeClass(evidence.status)}`}>{evidence.status}</span>
        <span className={`badge ${getRelevanceBadgeClass(evidence.relevance)}`}>
          {evidence.relevance}
        </span>
      </div>

      {evidence.tags && evidence.tags.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          {evidence.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
