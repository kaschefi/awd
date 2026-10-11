import React from 'react';
import type { TimelineEvent } from '../../types.js';
import { formatDate, certaintyBadgeClass } from '../../utils.js';

export interface TimelineEventCardProps {
  event: TimelineEvent;
  locationNames?: string[];
  onViewEvidence?: (evidenceId: string) => void;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  locationNames = [],
  onViewEvidence,
}) => {
  const badgeClass = certaintyBadgeClass(event.certainty);

  return (
    <div className={`timeline-event certainty-${event.certainty}`}>
      <div className="timeline-time">
        {formatDate(event.time)}&nbsp;&middot;&nbsp;
        <span className={`badge badge-${badgeClass}`}>{event.certainty}</span>
      </div>

      <h3>{event.title}</h3>
      <p>{event.description}</p>

      {locationNames.length > 0 && (
        <p className="evidence-meta">Location: {locationNames.join(', ')}</p>
      )}

      {event.evidenceIds && event.evidenceIds.length > 0 && (
        <div>
          {event.evidenceIds.map((evidenceId) => (
            <button
              key={evidenceId}
              type="button"
              className="evidence-link-btn"
              onClick={() => onViewEvidence?.(evidenceId)}
            >
              View {evidenceId}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


