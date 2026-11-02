import React, { useState, useReducer, useMemo, useEffect, useRef } from 'react';
import { usePortalData } from '../../hooks/usePortalData.js';
import { fetchEvidenceData } from '../../dataLoader.js';
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
  initialPersonFilter?: string | null;
  bookmarks?: string[];
  onToggleBookmark?: (id: string) => void;
  onSaveNote?: (evidenceId: string, noteText: string) => void;
  onNavigateToWorkspace?: () => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  initialSelectedId = null,
  initialPersonFilter = null,
  bookmarks: propBookmarks,
  onToggleBookmark: propToggleBookmark,
  onSaveNote: propSaveNote,
}) => {
  const { evidence: masterEvidence, people, locations, isLoading, error, refetch } =
    usePortalData();

  // Local state for Evidence Catalogue
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(masterEvidence);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(initialSelectedId);

  // Demo 7: useReducer consolidating 7+ related filter/search/sort values
  const [filterState, dispatch] = useReducer(evidenceFilterReducer, initialFilterState);

  // Synchronize when data loader finishes
  useEffect(() => {
    setEvidenceList(masterEvidence);
  }, [masterEvidence]);

  // Demo 7: Request Race Condition & AbortController Testing
  const [showRaceTester, setShowRaceTester] = useState(false);
  const [useAbortFix, setUseAbortFix] = useState(true);
  const [raceLog, setRaceLog] = useState<string[]>([]);
  const activeControllerRef = useRef<AbortController | null>(null);

  const triggerRaceRequest = async (label: string, delayMs: number) => {
    if (useAbortFix && activeControllerRef.current) {
      setRaceLog((prev) => [
        `[${new Date().toLocaleTimeString()}] [ABORT] Canceling previous in-flight request before starting ${label}`,
        ...prev.slice(0, 7),
      ]);
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    setRaceLog((prev) => [
      `[${new Date().toLocaleTimeString()}] [FETCH] Dispatched ${label} (delay: ${delayMs}ms)`,
      ...prev.slice(0, 7),
    ]);

    try {
      const data = await fetchEvidenceData(
        useAbortFix ? controller.signal : undefined,
        `?delay=${delayMs}`
      );
      setEvidenceList(data);
      setRaceLog((prev) => [
        `[${new Date().toLocaleTimeString()}] [RESOLVED] ${label} finished. Displaying ${data.length} records.`,
        ...prev.slice(0, 7),
      ]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setRaceLog((prev) => [
          `[${new Date().toLocaleTimeString()}] [CANCELED] ${label} was aborted by AbortController (stale response discarded).`,
          ...prev.slice(0, 7),
        ]);
        return;
      }
      setRaceLog((prev) => [
        `[${new Date().toLocaleTimeString()}] [ERROR] ${label} failed: ${(err as Error).message}`,
        ...prev.slice(0, 7),
      ]);
    }
  };

  // Demo 10: Declarative person filter synchronization (eliminates manual DOM manipulation)
  useEffect(() => {
    if (initialPersonFilter) {
      dispatch({
        type: 'SET_FILTER',
        payload: { filterKey: 'filterPerson', value: initialPersonFilter },
      });
    }
  }, [initialPersonFilter]);

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

      {/* Demo 7: Interactive Request Race & Cancellation Simulator */}
      <div
        style={{
          margin: '1rem 0 1.5rem 0',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>[Demo 7] Request Race &amp; Cancellation Sandbox</span>
          </h4>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowRaceTester((prev) => !prev)}
            style={{ fontSize: '0.8rem', padding: '4px 10px', cursor: 'pointer' }}
          >
            {showRaceTester ? 'Hide Sandbox [-]' : 'Open Sandbox [+]'}
          </button>
        </div>

        {showRaceTester && (
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <p style={{ color: 'var(--color-text-muted)', margin: '0 0 0.75rem 0' }}>
              Demonstrate request races: click <strong>1. Trigger Slow Request (3000ms)</strong>,
              then immediately click <strong>2. Trigger Fast Request (0ms)</strong>.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={useAbortFix}
                  onChange={(e) => setUseAbortFix(e.target.checked)}
                />
                Enable AbortController Fix
              </label>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => triggerRaceRequest('Slow Request #1', 3000)}
                style={{ fontSize: '0.85rem', cursor: 'pointer' }}
              >
                1. Trigger Slow Request (3000ms)
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => triggerRaceRequest('Fast Request #2', 0)}
                style={{ fontSize: '0.85rem', cursor: 'pointer' }}
              >
                2. Trigger Fast Request (0ms)
              </button>
            </div>

            {raceLog.length > 0 && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                }}
              >
                {raceLog.map((log, idx) => (
                  <div key={idx} style={{ padding: '2px 0' }}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
          error={error}
          onRetry={refetch}
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
