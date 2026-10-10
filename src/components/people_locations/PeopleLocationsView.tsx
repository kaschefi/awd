import React, { useState } from 'react';
import type { Person, Location } from '../../types.js';
import { PeopleList } from './PeopleList.js';
import { LocationsList } from './LocationsList.js';
import { usePortalData } from '../../hooks/usePortalData.js';

export interface PeopleLocationsViewProps {
  initialTab?: 'people' | 'locations';
  people?: Person[];
  locations?: Location[];
  onNavigateToEvidence?: (personId: string) => void;
}

export const PeopleLocationsView: React.FC<PeopleLocationsViewProps> = ({
  initialTab = 'people',
  people: propPeople,
  locations: propLocations,
  onNavigateToEvidence,
}) => {
  const portal = usePortalData();
  const people = propPeople ?? portal.people;
  const locations = propLocations ?? portal.locations;

  const [activeTab, setActiveTab] = useState<'people' | 'locations'>(initialTab);


  return (
    <section className="view active" id="view-people">
      <div className="view-header">
        <h2>Personnel & Facility Locations</h2>
        <p className="view-subtitle">
          Review personnel statements, team roles, and facility structures involved in the incident.
        </p>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {/* Technique: Ternary for state-dependent active class */}
        <button
          type="button"
          className={`tab-btn ${activeTab === 'people' ? 'active' : ''}`}
          onClick={() => setActiveTab('people')}
        >
          Personnel ({people.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          Locations ({locations.length})
        </button>
      </div>

      {/* Technique: Ternary conditional rendering of panels */}
      {activeTab === 'people' ? (
        <PeopleList people={people} onViewEvidence={onNavigateToEvidence} />
      ) : (
        <LocationsList locations={locations} />
      )}
    </section>

  );
};
