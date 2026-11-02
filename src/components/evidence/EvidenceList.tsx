import React from 'react';
import type { Evidence } from '../../types.js';
import { EvidenceCard } from './EvidenceCard.js';

export interface EvidenceListProps {
  evidence: Evidence[];
  bookmarks?: string[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onToggleBookmark?: (id: string) => void;
  onSelectEvidence?: (id: string) => void;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  evidence,
  bookmarks,
  isLoading = false,
  error = null,
  onRetry,
  onToggleBookmark,
  onSelectEvidence,
}) => {
  // Demo 6: Tri-State Handling — State 1: Loading Indicator
  if (isLoading) {
    return (
      <div
        id="evidenceLoadingIndicator"
        className="evidence-loading"
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: 'var(--color-bg-card, rgba(255, 255, 255, 0.03))',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="spinner" style={{ margin: '0 auto 1.25rem auto' }}></div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Loading Evidence Catalogue…</h3>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Querying backend REST API (<code style={{ color: 'var(--color-accent)' }}>/api/evidence</code>)
        </p>
      </div>
    );
  }

  // Demo 6: Tri-State Handling — State 2: Explicit Error Message with Retry
  if (error) {
    return (
      <div
        id="evidenceErrorState"
        className="error-state"
        role="alert"
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          margin: '1rem 0',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '4px',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: '0.75rem',
          }}
        >
          [HTTP ERROR]
        </div>
        <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Failed to Load Evidence</h3>
        <p
          style={{
            color: 'var(--color-text-main)',
            maxWidth: '520px',
            margin: '0 auto 1.25rem auto',
            lineHeight: 1.5,
          }}
        >
          {error.message || 'An error occurred while fetching data from the backend.'}
        </p>
        {onRetry && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRetry}
            style={{
              background: '#ef4444',
              borderColor: '#dc2626',
              fontWeight: 600,
              padding: '0.5rem 1.25rem',
              cursor: 'pointer',
            }}
          >
            Retry Request
          </button>
        )}
      </div>
    );
  }

  // Demo 6: Tri-State Handling — State 3: Distinct Empty State
  if (evidence.length === 0) {
    return (
      <div
        id="evidenceEmptyState"
        className="empty-state"
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          background: 'var(--color-bg-card, rgba(255, 255, 255, 0.02))',
          border: '1px dashed var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--color-text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '0.75rem',
          }}
        >
          [EMPTY RESULT]
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>No Evidence Records Found</h3>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          The backend returned zero records or no items match your active filters.
        </p>
      </div>
    );
  }

  // Normal Loaded State: Grid of Cards
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
