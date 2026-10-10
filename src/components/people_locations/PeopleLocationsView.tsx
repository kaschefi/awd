import React, { useState } from 'react';
import type { Person, Location } from '../../types.js';
import { PeopleList } from './PeopleList.js';
import { LocationsList } from './LocationsList.js';
import { state } from '../../state.js';

export interface PeopleLocationsViewProps {
  initialTab?: 'people' | 'locations';
  people?: Person[];
  locations?: Location[];
  onNavigateToEvidence?: (personId: string) => void;
}

export const PeopleLocationsView: React.FC<PeopleLocationsViewProps> = ({
  initialTab = 'people',
  people = state.allPeople,
  locations = state.allLocations,
  onNavigateToEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<'people' | 'locations'>(initialTab);

  return (
    <div className="people-locations-view">
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
    </div>
  );
};
