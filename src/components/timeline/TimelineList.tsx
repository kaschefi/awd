import React from 'react';
import type { TimelineEvent } from '../../types.js';
import { TimelineEventCard } from './TimelineEventCard.js';
import { findLocationById } from '../../lookup.js';

export interface TimelineListProps {
  events: TimelineEvent[];
  onViewEvidence?: (evidenceId: string) => void;
}

export const TimelineList: React.FC<TimelineListProps> = ({ events, onViewEvidence }) => {
  // Technique 1: Early-return for Empty State
  if (events.length === 0) {
    return (
      <div className="empty-state">
        <p>No timeline events match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {events.map((event) => {
        const locationNames = (event.locationIds || [])
          .map((locId) => {
            const loc = findLocationById(locId);
            return loc ? `${loc.id} - ${loc.name}` : locId;
          })
          .filter(Boolean);

        return (
          <TimelineEventCard
            key={event.id}
            event={event}
            locationNames={locationNames}
            onViewEvidence={onViewEvidence}
          />
        );
      })}
    </div>




  );
};
