import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TimelineEvent, Person, Location } from '../../types.js';
import { TimelineList } from './TimelineList.js';
import { TimelineToolbar } from './TimelineToolbar.js';
import { usePortalData } from '../../hooks/usePortalData.js';
import { useFetch } from '../../hooks/useFetch.js';

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

  // Demo 8 Usage 1: Reusable custom hook useFetch<TimelineEvent[]>
  const {
    data: fetchedEvents,
    isLoading: timelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useFetch<TimelineEvent[]>('/api/timeline', {
    fallbackUrl: './data/timeline.json',
  });

  const events = propEvents ?? fetchedEvents ?? portal.timeline;
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

      {timelineLoading && events.length === 0 && (
        <div className="evidence-loading" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading Investigation Timeline…</p>
        </div>
      )}

      {timelineError && (
        <div
          className="error-state"
          role="alert"
          style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            margin: '1.5rem 0',
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
          <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Failed to Load Timeline</h3>
          <p style={{ color: 'var(--color-text-main)', margin: '0 auto 1.25rem auto' }}>
            {timelineError.message || 'Unable to retrieve timeline events from backend.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={refetchTimeline}
            style={{ background: '#ef4444', borderColor: '#dc2626', cursor: 'pointer' }}
          >
            Retry Request
          </button>
        </div>
      )}

      {(!timelineLoading || events.length > 0) && !timelineError && (
        <TimelineList events={displayedEvents} onViewEvidence={onViewEvidence} />
      )}
    </section>
  );
};

