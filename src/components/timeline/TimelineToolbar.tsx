import React from 'react';
import type { Person, Location } from '../../types.js';

export interface TimelineToolbarProps {
  order: 'asc' | 'desc';
  onOrderChange: (order: 'asc' | 'desc') => void;
  selectedPerson?: string;
  onPersonChange?: (personId: string) => void;
  selectedLocation?: string;
  onLocationChange?: (locationId: string) => void;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  people: Person[];
  locations: Location[];
  eventTypes: string[];
}

/**
 * Presentational component responsible solely for rendering filter & sort controls.
 * It has no internal state and is decoupled from data-fetching logic.
 */
export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({
  order,
  onOrderChange,
  selectedPerson = '',
  onPersonChange,
  selectedLocation = '',
  onLocationChange,
  selectedType = '',
  onTypeChange,
  people,
  locations,
  eventTypes,
}) => {
  return (
    <div className="toolbar" id="timelineToolbar" style={{ marginBottom: '1.5rem' }}>
      <div className="toolbar-row">
        <label htmlFor="timelineOrder" className="visually-hidden">
          Order
        </label>
        <select
          id="timelineOrder"
          value={order}
          onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
        >
          <option value="asc">Oldest first</option>
          <option value="desc">Newest first</option>
        </select>

        <label htmlFor="timelinePersonFilter" className="visually-hidden">
          Filter by person
        </label>
        <select
          id="timelinePersonFilter"
          value={selectedPerson}
          onChange={(e) => onPersonChange?.(e.target.value)}
        >
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
        <select
          id="timelineLocationFilter"
          value={selectedLocation}
          onChange={(e) => onLocationChange?.(e.target.value)}
        >
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
        <select
          id="timelineTypeFilter"
          value={selectedType}
          onChange={(e) => onTypeChange?.(e.target.value)}
        >
          <option value="">All event types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
