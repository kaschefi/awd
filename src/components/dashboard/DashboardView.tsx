import React, { useMemo, useContext } from 'react';
import { usePortalData } from '../../hooks/usePortalData.js';
import { BookmarkContext } from '../../context/BookmarkContext.js';
import { CaseSummaryCard } from './CaseSummaryCard.js';
import { StatGrid } from './StatGrid.js';
import { ReviewProgress } from './ReviewProgress.js';
import { HowToUsePortal } from './HowToUsePortal.js';
import { RecentEvidenceList } from './RecentEvidenceList.js';
import { RecentTimelineList } from './RecentTimelineList.js';
import type { ViewKey } from '../../types/navigation.js';

interface DashboardViewProps {
  onNavigate?: (view: ViewKey) => void;
  bookmarks?: string[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  bookmarks: propBookmarks,
}) => {
  const {
    caseData,
    evidence,
    people,
    locations,
    timeline,
    bookmarks: portalBookmarks,
    isLoading,
    error,
    refetch,
  } = usePortalData();
  const bookmarkContext = useContext(BookmarkContext);
  const bookmarks = propBookmarks ?? bookmarkContext?.bookmarks ?? portalBookmarks;

  // Derived values computed synchronously during render:
  // "Don't put in state what you can compute during render."
  const reviewedCount = useMemo(() => {
    return evidence.filter((item) => (item.status || '').toLowerCase() === 'reviewed').length;
  }, [evidence]);

  const progressPct = useMemo(() => {
    return evidence.length === 0 ? 0 : Math.round((reviewedCount / evidence.length) * 100);
  }, [evidence.length, reviewedCount]);

  if (isLoading && evidence.length === 0) {
    return (
      <div className="evidence-loading" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Loading Case Dashboard data&hellip;</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="error-state"
        role="alert"
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          margin: '2rem auto',
          maxWidth: '600px',
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
        <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Failed to Load Dashboard</h3>
        <p style={{ color: 'var(--color-text-main)', margin: '0 auto 1.25rem auto' }}>
          {error.message || 'Unable to connect to case investigation backend.'}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={refetch}
          style={{ background: '#ef4444', borderColor: '#dc2626', cursor: 'pointer' }}
        >
          Retry Request
        </button>
      </div>
    );
  }

  return (
    <section id="view-dashboard" className="view active">
      <h2>Case Dashboard</h2>

      <HowToUsePortal onNavigate={onNavigate} />

      <CaseSummaryCard caseData={caseData} />

      <StatGrid
        evidenceCount={evidence.length}
        peopleCount={people.length}
        locationsCount={locations.length}
        bookmarkCount={bookmarks.length}
        reviewedCount={reviewedCount}
      />

      <ReviewProgress
        reviewedCount={reviewedCount}
        totalCount={evidence.length}
        progressPct={progressPct}
      />

      <div className="dashboard-columns">
        <RecentEvidenceList evidence={evidence} />
        <RecentTimelineList timeline={timeline} />
      </div>
    </section>
  );
};
