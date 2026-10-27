import React, { useState, useMemo, useEffect } from 'react';
import { usePortalData } from '../../hooks/usePortalData.js';
import { EvidenceToolbar } from './EvidenceToolbar.js';
import { EvidenceList } from './EvidenceList.js';
import { EvidenceDetailModal } from './EvidenceDetailModal.js';
import {
  state,
  saveBookmarksToStorage,
  saveNoteForEvidence,
  loadNoteForEvidence,
} from '../../state.js';
import type { Evidence, EvidenceStatus, EvidenceRelevance } from '../../types.js';

export interface EvidenceViewProps {
  initialSelectedId?: string | null;
  bookmarks?: string[];
  onToggleBookmark?: (id: string) => void;
  onSaveNote?: (evidenceId: string, noteText: string) => void;
  onNavigateToWorkspace?: () => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  initialSelectedId = null,
  bookmarks: propBookmarks,
  onToggleBookmark: propToggleBookmark,
  onSaveNote: propSaveNote,
}) => {
  const { evidence: masterEvidence, people, locations, bookmarks: initialBookmarks, isLoading } =
    usePortalData();

  // Local state for Evidence Catalogue
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(masterEvidence);
  const [localBookmarks, setLocalBookmarks] = useState<string[]>(initialBookmarks);
  const bookmarks = propBookmarks ?? localBookmarks;
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(initialSelectedId);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPerson, setFilterPerson] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRelevance, setFilterRelevance] = useState('');
  const [sortValue, setSortValue] = useState('date-desc');

  // Synchronize when data loader finishes
  useEffect(() => {
    if (masterEvidence.length > 0) {
      setEvidenceList(masterEvidence);
    }
  }, [masterEvidence]);

  useEffect(() => {
    setLocalBookmarks(state.bookmarks);
  }, [initialBookmarks]);

  // Extract unique types for dropdown
  const uniqueTypes = useMemo(() => {
    const set = new Set<string>();
    masterEvidence.forEach((item) => {
      if (item.type) set.add(item.type.toLowerCase());
    });
    return Array.from(set).sort();
  }, [masterEvidence]);

  // Derived filtered & sorted evidence
  const filteredAndSortedEvidence = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const matches = evidenceList.filter((item) => {
      if (term) {
        const haystack = (item.title + ' ' + item.summary + ' ' + (item.tags || []).join(' ')).toLowerCase();
        if (haystack.indexOf(term) === -1) return false;
      }

      if (filterType && item.type.toLowerCase() !== filterType.toLowerCase()) return false;

      if (filterPerson) {
        const pIds = item.personIds || [];
        const person = people.find((p) => p.id === filterPerson);
        const personName = person ? person.name : '';
        const hasPerson = pIds.includes(filterPerson) || (personName && pIds.includes(personName));
        if (!hasPerson) return false;
      }

      if (filterLocation && (!item.locationIds || !item.locationIds.includes(filterLocation))) {
        return false;
      }

      if (filterStatus && (item.status || '').toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }

      if (filterRelevance && (item.relevance || '').toLowerCase() !== filterRelevance.toLowerCase()) {
        return false;
      }

      return true;
    });

    // Immutable sorting
    return [...matches].sort((a, b) => {
      if (sortValue === 'title-asc') return a.title.localeCompare(b.title);
      if (sortValue === 'title-desc') return b.title.localeCompare(a.title);
      if (sortValue === 'date-asc') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [
    evidenceList,
    searchTerm,
    filterType,
    filterPerson,
    filterLocation,
    filterStatus,
    filterRelevance,
    sortValue,
    people,
  ]);

  // Event Handlers
  const handleToggleBookmark = (id: string) => {
    if (propToggleBookmark) {
      propToggleBookmark(id);
    } else {
      setLocalBookmarks((prev) => {
        const exists = prev.includes(id);
        const next = exists ? prev.filter((bId) => bId !== id) : [...prev, id];
        state.bookmarks = next;
        saveBookmarksToStorage();
        return next;
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterPerson('');
    setFilterLocation('');
    setFilterStatus('');
    setFilterRelevance('');
    setSortValue('date-desc');
  };

  const handleUpdateStatus = (evidenceId: string, newStatus: EvidenceStatus) => {
    setEvidenceList((prev) =>
      prev.map((ev) => (ev.id === evidenceId ? { ...ev, status: newStatus } : ev))
    );
    // Also update legacy state item if present
    const item = state.allEvidence.find((ev) => ev.id === evidenceId);
    if (item) item.status = newStatus;
  };

  const handleUpdateRelevance = (evidenceId: string, newRelevance: EvidenceRelevance) => {
    setEvidenceList((prev) =>
      prev.map((ev) => (ev.id === evidenceId ? { ...ev, relevance: newRelevance } : ev))
    );
    const item = state.allEvidence.find((ev) => ev.id === evidenceId);
    if (item) item.relevance = newRelevance;
  };

  const handleSaveNote = (evidenceId: string, noteText: string) => {
    if (propSaveNote) {
      propSaveNote(evidenceId, noteText);
    } else {
      saveNoteForEvidence(evidenceId, noteText);
    }
  };

  const selectedEvidence = useMemo(() => {
    if (!selectedEvidenceId) return null;
    return evidenceList.find((ev) => ev.id === selectedEvidenceId) || null;
  }, [evidenceList, selectedEvidenceId]);

  return (
    <section id="view-evidence" className="view active">
      <h2>Evidence Catalogue</h2>

      <EvidenceToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterPerson={filterPerson}
        onPersonChange={setFilterPerson}
        filterLocation={filterLocation}
        onLocationChange={setFilterLocation}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterRelevance={filterRelevance}
        onRelevanceChange={setFilterRelevance}
        sortValue={sortValue}
        onSortChange={setSortValue}
        onClearFilters={handleClearFilters}
        types={uniqueTypes}
        people={people}
        locations={locations}
      />

      <div id="evidenceListContainer" style={{ marginTop: '1.5rem' }}>
        <EvidenceList
          evidence={filteredAndSortedEvidence}
          bookmarks={bookmarks}
          isLoading={isLoading && evidenceList.length === 0}
          onToggleBookmark={handleToggleBookmark}
          onSelectEvidence={setSelectedEvidenceId}
        />
      </div>

      {selectedEvidence && (
        <EvidenceDetailModal
          evidence={selectedEvidence}
          people={people}
          locations={locations}
          onClose={() => setSelectedEvidenceId(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateRelevance={handleUpdateRelevance}
          onSaveNote={handleSaveNote}
          initialNote={loadNoteForEvidence(selectedEvidence.id)}
        />
      )}
    </section>
  );
};
