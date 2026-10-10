import React from 'react';
import type { TimelineEvent, Person, Location } from '../../types.js';
import { TimelineList } from './TimelineList.js';
import { state } from '../../state.js';

export interface TimelineViewProps {
  events?: TimelineEvent[];
  people?: Person[];
  locations?: Location[];
  selectedPersonFilter?: string;
  onViewEvidence?: (evidenceId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events = state.allTimeline,
  people = state.allPeople,
  locations = state.allLocations,
  selectedPersonFilter = '',
  onViewEvidence,
}) => {
  // Extract unique event types
  const eventTypes = Array.from(new Set(events.map((e) => e.type).filter(Boolean)));

  // If a filter was initially supplied via query param (prep for Demo 10)
  const displayedEvents = selectedPersonFilter
    ? events.filter((e) => e.personIds && e.personIds.includes(selectedPersonFilter))
    : events;

  return (
    <section className="view" id="view-timeline">
      <div className="view-header">
        <h2>Investigation Timeline</h2>
        <p className="view-subtitle">
          Chronological reconstruction of events leading up to the robot malfunction.
        </p>
      </div>

      <div className="toolbar" id="timelineToolbar" style={{ marginBottom: '1.5rem' }}>
        <div className="toolbar-row">
          <label htmlFor="timelineOrder" className="visually-hidden">
            Order
          </label>
          <select id="timelineOrder" defaultValue="asc">
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </select>

          <label htmlFor="timelinePersonFilter" className="visually-hidden">
            Filter by person
          </label>
          <select id="timelinePersonFilter" defaultValue={selectedPersonFilter}>
            <option value="">All people</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>

          <label htmlFor="timelineLocationFilter" className="visually-hidden">
            Filter by location
          </label>
          <select id="timelineLocationFilter" defaultValue="">
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <label htmlFor="timelineTypeFilter" className="visually-hidden">
            Filter by event type
          </label>
          <select id="timelineTypeFilter" defaultValue="">
            <option value="">All event types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TimelineList events={displayedEvents} onViewEvidence={onViewEvidence} />
    </section>
  );
};
