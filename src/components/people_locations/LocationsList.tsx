import React from 'react';
import type { Location } from '../../types.js';
import { LocationCard } from './LocationCard.js';

export interface LocationsListProps {
  locations: Location[];
}

export const LocationsList: React.FC<LocationsListProps> = ({ locations }) => {
  if (locations.length === 0) {
    return <p className="empty-state">No locations registered.</p>;
  }

  return (
    <div className="locations-grid">
      {locations.map((loc) => (
        <LocationCard key={loc.id} location={loc} />
      ))}
    </div>
  );
};
