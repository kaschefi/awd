import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import type { Person, Location } from '../../types.js';
import { PeopleList } from './PeopleList.js';
import { PersonDetailView } from './PersonDetailView.js';
import { LocationsList } from './LocationsList.js';
import { usePortalData } from '../../hooks/usePortalData.js';

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
  const people = propPeople ?? portal.people;
  const locations = propLocations ?? portal.locations;

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
