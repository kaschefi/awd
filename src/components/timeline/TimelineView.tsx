import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  selectedPersonFilter: propPersonFilter = '',
  onViewEvidence,
}) => {
  const portal = usePortalData();
  const events = propEvents ?? portal.timeline;
  const people = propPeople ?? portal.people;
  const locations = propLocations ?? portal.locations;

  // Read URL query parameters on initial render (Demo 10)
  const [searchParams] = useSearchParams();
  const personQuery = searchParams.get('person') || propPersonFilter;
  const locationQuery = searchParams.get('location') || '';
  const typeQuery = searchParams.get('type') || '';
  const initialOrder = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

  const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder);

  // Extract unique event types
  const eventTypes = Array.from(new Set(events.map((e) => e.type).filter(Boolean)));

  // Parameterize initial render based on URL query parameters
  let filtered = events;
  if (personQuery) {
    filtered = filtered.filter((e) => e.personIds && e.personIds.includes(personQuery));
  }
  if (locationQuery) {
    filtered = filtered.filter((e) => e.locationIds && e.locationIds.includes(locationQuery));
  }
  if (typeQuery) {
    filtered = filtered.filter((e) => e.type === typeQuery);
  }

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
        selectedPerson={personQuery}
        selectedLocation={locationQuery}
        selectedType={typeQuery}
        people={people}
        locations={locations}
        eventTypes={eventTypes}
      />

      <TimelineList events={displayedEvents} onViewEvidence={onViewEvidence} />
    </section>
  );
};

