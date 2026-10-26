import React from 'react';
import type { Person, Location } from '../../types.js';

export interface EvidenceToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
  filterPerson: string;
  onPersonChange: (value: string) => void;
  filterLocation: string;
  onLocationChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterRelevance: string;
  onRelevanceChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  types: string[];
  people: Person[];
  locations: Location[];
}

export const EvidenceToolbar: React.FC<EvidenceToolbarProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onTypeChange,
  filterPerson,
  onPersonChange,
  filterLocation,
  onLocationChange,
  filterStatus,
  onStatusChange,
  filterRelevance,
  onRelevanceChange,
  sortValue,
  onSortChange,
  onClearFilters,
  types,
  people,
  locations,
}) => {
  return (
    <div className="toolbar" id="evidenceToolbar">
      <div className="toolbar-row">
        <label htmlFor="evidenceSearch" className="visually-hidden">
          Search evidence
        </label>
        <input
          type="text"
          id="evidenceSearch"
          placeholder="Search evidence by title, summary, or tag…"
          autoComplete="off"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <label htmlFor="filterType" className="visually-hidden">
          Filter by type
        </label>
        <select
          id="filterType"
          value={filterType}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label htmlFor="filterPerson" className="visually-hidden">
          Filter by person
        </label>
        <select
          id="filterPerson"
          value={filterPerson}
          onChange={(e) => onPersonChange(e.target.value)}
        >
          <option value="">All people</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label htmlFor="filterLocation" className="visually-hidden">
          Filter by location
        </label>
        <select
          id="filterLocation"
          value={filterLocation}
          onChange={(e) => onLocationChange(e.target.value)}
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.id} - {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-row">
        <label htmlFor="filterStatus" className="visually-hidden">
          Filter by status
        </label>
        <select
          id="filterStatus"
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>

        <label htmlFor="filterRelevance" className="visually-hidden">
          Filter by relevance
        </label>
        <select
          id="filterRelevance"
          value={filterRelevance}
          onChange={(e) => onRelevanceChange(e.target.value)}
        >
          <option value="">All relevance</option>
          <option value="unknown">Unknown</option>
          <option value="relevant">Relevant</option>
          <option value="irrelevant">Irrelevant</option>
        </select>

        <label htmlFor="sortEvidence" className="visually-hidden">
          Sort evidence
        </label>
        <select
          id="sortEvidence"
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="title-asc">Title (A–Z)</option>
          <option value="title-desc">Title (Z–A)</option>
        </select>

        <button
          type="button"
          id="clearFiltersBtn"
          className="btn btn-secondary"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};
