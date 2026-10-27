import React, { useState, useReducer, useMemo, useEffect } from 'react';
import { usePortalData } from '../../hooks/usePortalData.js';
import { EvidenceToolbar } from './EvidenceToolbar.js';
import { EvidenceList } from './EvidenceList.js';
import { EvidenceDetailModal } from './EvidenceDetailModal.js';
import {
  evidenceFilterReducer,
  initialFilterState,
  type EvidenceSortOrder,
} from '../../reducers/evidenceFilterReducer.js';
import {
  state,
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
  const { evidence: masterEvidence, people, locations, isLoading } =
    usePortalData();

  // Local state for Evidence Catalogue
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(masterEvidence);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(initialSelectedId);

  // Demo 7: useReducer consolidating 7+ related filter/search/sort values
  const [filterState, dispatch] = useReducer(evidenceFilterReducer, initialFilterState);

  // Synchronize when data loader finishes
  useEffect(() => {
    if (masterEvidence.length > 0) {
      setEvidenceList(masterEvidence);
    }
  }, [masterEvidence]);

  // Extract unique types for dropdown
  const uniqueTypes = useMemo(() => {
    const set = new Set<string>();
    masterEvidence.forEach((item) => {
      if (item.type) set.add(item.type.toLowerCase());
    });
    return Array.from(set).sort();
  }, [masterEvidence]);

  // Derived filtered & sorted evidence using reducer filterState
  const filteredAndSortedEvidence = useMemo(() => {
    const term = filterState.searchTerm.toLowerCase().trim();

    const matches = evidenceList.filter((item) => {
      if (term) {
        const haystack = (item.title + ' ' + item.summary + ' ' + (item.tags || []).join(' ')).toLowerCase();
        if (haystack.indexOf(term) === -1) return false;
      }

      if (filterState.filterType && item.type.toLowerCase() !== filterState.filterType.toLowerCase()) {
        return false;
      }

      if (filterState.filterPerson) {
        const pIds = item.personIds || [];
        const person = people.find((p) => p.id === filterState.filterPerson);
        const personName = person ? person.name : '';
        const hasPerson =
          pIds.includes(filterState.filterPerson) ||
          (personName && pIds.includes(personName));
        if (!hasPerson) return false;
      }

      if (
        filterState.filterLocation &&
        (!item.locationIds || !item.locationIds.includes(filterState.filterLocation))
      ) {
        return false;
      }

      if (
        filterState.filterStatus &&
        (item.status || '').toLowerCase() !== filterState.filterStatus.toLowerCase()
      ) {
        return false;
      }

      if (
        filterState.filterRelevance &&
        (item.relevance || '').toLowerCase() !== filterState.filterRelevance.toLowerCase()
      ) {
        return false;
      }

      return true;
    });

    // Immutable sorting
    return [...matches].sort((a, b) => {
      if (filterState.sortValue === 'title-asc') return a.title.localeCompare(b.title);
      if (filterState.sortValue === 'title-desc') return b.title.localeCompare(a.title);
      if (filterState.sortValue === 'date-asc') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [evidenceList, filterState, people]);

  // Event Handlers
  const handleUpdateStatus = (evidenceId: string, newStatus: EvidenceStatus) => {
    setEvidenceList((prev) =>
      prev.map((ev) => (ev.id === evidenceId ? { ...ev, status: newStatus } : ev))
    );
    // Demo 9 fix: Immutably project legacy state instead of direct in-place object mutation
    state.allEvidence = state.allEvidence.map((ev) =>
      ev.id === evidenceId ? { ...ev, status: newStatus } : ev
    );
  };

  const handleUpdateRelevance = (evidenceId: string, newRelevance: EvidenceRelevance) => {
    setEvidenceList((prev) =>
      prev.map((ev) => (ev.id === evidenceId ? { ...ev, relevance: newRelevance } : ev))
    );
    // Demo 9 fix: Immutably project legacy state instead of direct in-place object mutation
    state.allEvidence = state.allEvidence.map((ev) =>
      ev.id === evidenceId ? { ...ev, relevance: newRelevance } : ev
    );
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
        searchTerm={filterState.searchTerm}
        onSearchChange={(val) => dispatch({ type: 'SET_SEARCH', payload: val })}
        filterType={filterState.filterType}
        onTypeChange={(val) =>
          dispatch({ type: 'SET_FILTER', payload: { filterKey: 'filterType', value: val } })
        }
        filterPerson={filterState.filterPerson}
        onPersonChange={(val) =>
          dispatch({ type: 'SET_FILTER', payload: { filterKey: 'filterPerson', value: val } })
        }
        filterLocation={filterState.filterLocation}
        onLocationChange={(val) =>
          dispatch({ type: 'SET_FILTER', payload: { filterKey: 'filterLocation', value: val } })
        }
        filterStatus={filterState.filterStatus}
        onStatusChange={(val) =>
          dispatch({ type: 'SET_FILTER', payload: { filterKey: 'filterStatus', value: val } })
        }
        filterRelevance={filterState.filterRelevance}
        onRelevanceChange={(val) =>
          dispatch({ type: 'SET_FILTER', payload: { filterKey: 'filterRelevance', value: val } })
        }
        sortValue={filterState.sortValue}
        onSortChange={(val) =>
          dispatch({ type: 'SET_SORT', payload: val as EvidenceSortOrder })
        }
        onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}
        types={uniqueTypes}
        people={people}
        locations={locations}
      />

      <div id="evidenceListContainer" style={{ marginTop: '1.5rem' }}>
        <EvidenceList
          evidence={filteredAndSortedEvidence}
          bookmarks={propBookmarks}
          isLoading={isLoading && evidenceList.length === 0}
          onToggleBookmark={propToggleBookmark}
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
