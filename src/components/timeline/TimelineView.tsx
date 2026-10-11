import React, { useState } from 'react';
import type { TimelineEvent, Person, Location } from '../../types.js';
import { TimelineList } from './TimelineList.js';
import { TimelineToolbar } from './TimelineToolbar.js';
import { usePortalData } from '../../hooks/usePortalData.js';

export interface TimelineViewProps {
  events?: TimelineEvent[];
  people?: Person[];
  locations?: Location[];
  selectedPersonFilter?: string;
  onViewEvidence?: (evidenceId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events: propEvents,
  people: propPeople,
  locations: propLocations,
  selectedPersonFilter = '',
  onViewEvidence,
}) => {
  const portal = usePortalData();
  const events = propEvents ?? portal.timeline;
  const people = propPeople ?? portal.people;
  const locations = propLocations ?? portal.locations;

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Extract unique event types
  const eventTypes = Array.from(new Set(events.map((e) => e.type).filter(Boolean)));

  // If a filter was initially supplied via query param (prep for Demo 10)
  const filtered = selectedPersonFilter
    ? events.filter((e) => e.personIds && e.personIds.includes(selectedPersonFilter))
    : events;

  const displayedEvents = [...filtered].sort((a, b) => {
    const diff = new Date(a.time).getTime() - new Date(b.time).getTime();
    return order === 'desc' ? -diff : diff;
  });

  return (
    <section className="view active" id="view-timeline">
      <div className="view-header">
        <h2>Investigation Timeline</h2>
        <p className="view-subtitle">
          Chronological reconstruction of events leading up to the robot malfunction.
        </p>
      </div>

      <TimelineToolbar
        order={order}
        onOrderChange={setOrder}
        selectedPerson={selectedPersonFilter}
        people={people}
        locations={locations}
        eventTypes={eventTypes}
      />

      <TimelineList events={displayedEvents} onViewEvidence={onViewEvidence} />
    </section>
  );
};

