import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import type { Person, Location } from '../../types.js';
import { PeopleList } from './PeopleList.js';
import { PersonDetailView } from './PersonDetailView.js';
import { LocationsList } from './LocationsList.js';
import { usePortalData } from '../../hooks/usePortalData.js';
import { useFetch } from '../../hooks/useFetch.js';

export interface PeopleLocationsViewProps {
  people?: Person[];
  locations?: Location[];
  onNavigateToEvidence?: (personId: string) => void;
}

export const PeopleLocationsView: React.FC<PeopleLocationsViewProps> = ({
  people: propPeople,
  locations: propLocations,
  onNavigateToEvidence,
}) => {
  const portal = usePortalData();

  // Demo 8 Usage 2: Reusable custom hook useFetch<Person[]> & useFetch<Location[]>
  const {
    data: fetchedPeople,
    isLoading: peopleLoading,
    error: peopleError,
    refetch: refetchPeople,
  } = useFetch<Person[]>('/api/people', { fallbackUrl: './data/people.json' });

  const {
    data: fetchedLocations,
    isLoading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useFetch<Location[]>('/api/locations', { fallbackUrl: './data/locations.json' });

  const people = propPeople ?? fetchedPeople ?? portal.people;
  const locations = propLocations ?? fetchedLocations ?? portal.locations;
  const hasError = peopleError || locationsError;
  const isLoading = (peopleLoading && people.length === 0) || (locationsLoading && locations.length === 0);

  if (hasError) {
    return (
      <section className="view active" id="view-people">
        <div className="view-header">
          <h2>People &amp; Locations</h2>
        </div>
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
          <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Failed to Load Team Data</h3>
          <p style={{ color: 'var(--color-text-main)', margin: '0 auto 1.25rem auto' }}>
            {(peopleError || locationsError)?.message || 'Failed to communicate with backend.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              refetchPeople();
              refetchLocations();
            }}
            style={{ background: '#ef4444', borderColor: '#dc2626', cursor: 'pointer' }}
          >
            Retry Request
          </button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="view active" id="view-people">
        <div className="view-header">
          <h2>People &amp; Locations</h2>
        </div>
        <div className="evidence-loading" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading Personnel and Locations…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="view active" id="view-people">
      <div className="view-header">
        <h2>People & Locations</h2>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <NavLink
          to="/team/people"
          className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
        >
          People ({people.length})
        </NavLink>
        <NavLink
          to="/team/locations"
          className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
        >
          Locations ({locations.length})
        </NavLink>
      </div>

      <Routes>
        <Route
          path="people"
          element={<PeopleList people={people} onViewEvidence={onNavigateToEvidence} />}
        />
        <Route
          path="people/:personId"
          element={<PersonDetailView people={people} onViewEvidence={onNavigateToEvidence} />}
        />
        <Route path="locations" element={<LocationsList locations={locations} />} />
        <Route path="" element={<Navigate to="people" replace />} />
        <Route path="*" element={<Navigate to="people" replace />} />
      </Routes>
    </section>
  );
};
