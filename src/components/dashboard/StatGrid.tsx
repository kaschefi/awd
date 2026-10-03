import React from 'react';
import { StatCard } from './StatCard';

interface StatGridProps {
  evidenceCount: number;
  peopleCount: number;
  locationsCount: number;
  bookmarkCount: number;
  reviewedCount: number;
}

export const StatGrid: React.FC<StatGridProps> = ({
  evidenceCount,
  peopleCount,
  locationsCount,
  bookmarkCount,
  reviewedCount,
}) => {
  return (
    <div className="stat-grid">
      <StatCard value={evidenceCount} label="Evidence items" />
      <StatCard value={peopleCount} label="People" />
      <StatCard value={locationsCount} label="Locations" />
      <StatCard value={bookmarkCount} label="Bookmarked" />
      <StatCard value={reviewedCount} label="Reviewed" />
    </div>
  );
};
