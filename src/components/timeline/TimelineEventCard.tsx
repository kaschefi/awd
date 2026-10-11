import React from 'react';
import { Link } from 'react-router-dom';
import type { TimelineEvent } from '../../types.js';
import { formatDate, certaintyBadgeClass } from '../../utils.js';
import { Badge } from '../common/Badge.js';

export interface TimelineEventCardProps {
  event: TimelineEvent;
  locationNames?: string[];
  persons?: { id: string; name: string }[];
  onViewEvidence?: (evidenceId: string) => void;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  locationNames = [],
  persons = [],
  onViewEvidence,
}) => {
  const badgeClass = certaintyBadgeClass(event.certainty);

  return (
    <div className={`timeline-event certainty-${event.certainty}`}>
      <div className="timeline-time">
        {formatDate(event.time)}&nbsp;&middot;&nbsp;
        <Badge variant={badgeClass}>{event.certainty}</Badge>
      </div>

      <h3>{event.title}</h3>
      <p>{event.description}</p>

      {locationNames.length > 0 && (
        <p className="evidence-meta">Location: {locationNames.join(', ')}</p>
      )}

      {persons.length > 0 && (
        <p className="evidence-meta">
          Involved personnel:{' '}
          {persons.map((person, idx) => (
            <span key={person.id}>
              {idx > 0 && ', '}
              <Link
                to={`/team/people/${person.id}`}
                style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}
                title={`View profile for ${person.name}`}
              >
                {person.name}
              </Link>
            </span>
          ))}
        </p>
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


