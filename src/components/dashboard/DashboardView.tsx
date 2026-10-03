import React, { useMemo } from 'react';
import { usePortalData } from '../../hooks/usePortalData.js';
import { CaseSummaryCard } from './CaseSummaryCard.js';
import { StatGrid } from './StatGrid.js';
import { ReviewProgress } from './ReviewProgress.js';
import { HowToUsePortal } from './HowToUsePortal.js';
import { RecentEvidenceList } from './RecentEvidenceList.js';
import { RecentTimelineList } from './RecentTimelineList.js';
import type { ViewKey } from '../../types/navigation.js';

interface DashboardViewProps {
  onNavigate: (view: ViewKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { caseData, evidence, people, locations, timeline, bookmarks, isLoading } = usePortalData();

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
