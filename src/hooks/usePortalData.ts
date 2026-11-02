import { useState, useEffect, useCallback } from 'react';
import { state } from '../state.js';
import {
  fetchCaseData,
  fetchPeopleData,
  fetchLocationsData,
  fetchTimelineData,
  fetchEvidenceData,
} from '../dataLoader.js';
import type { CaseData, Person, Location, TimelineEvent, Evidence } from '../types.js';

export interface PortalData {
  caseData: Partial<CaseData>;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
  bookmarks: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePortalData(): PortalData {
  const [data, setData] = useState<{
    caseData: Partial<CaseData>;
    evidence: Evidence[];
    people: Person[];
    locations: Location[];
    timeline: TimelineEvent[];
    bookmarks: string[];
  }>(() => ({
    caseData: state.caseData,
    evidence: state.allEvidence,
    people: state.allPeople,
    locations: state.allLocations,
    timeline: state.allTimeline,
    bookmarks: state.bookmarks,
  }));

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

    const loadData = useCallback(async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('[usePortalData] Fetching resources from backend /api/* endpoints...');
        const [caseData, people, locations, timeline, evidence] = await Promise.all([
          fetchCaseData(signal),
          fetchPeopleData(signal),
          fetchLocationsData(signal),
          fetchTimelineData(signal),
          fetchEvidenceData(signal),
        ]);

        if (signal?.aborted) return;

        // Synchronize shared memory state
        state.caseData = caseData;
        state.allPeople = people;
        state.allLocations = locations;
        state.allTimeline = timeline;
        state.allEvidence = evidence;
        state.filteredEvidence = evidence;

        setData({
          caseData,
          people,
          locations,
          timeline,
          evidence,
          bookmarks: state.bookmarks,
        });
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[usePortalData] Request aborted via AbortController signal');
          return;
        }
        if (signal?.aborted) return;
        console.error('[usePortalData] Network fetch failed:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
          if (!signal?.aborted) {
            setIsLoading(false);
          }
        }
      }, []);

    // Demo 5 & 7: Data fetching with AbortController wired to cleanup
    useEffect(() => {
      const controller = new AbortController();

      loadData(controller.signal);

      return () => {
        console.log('[usePortalData Cleanup] Aborting in-flight fetch via AbortController');
        controller.abort();
      };
    }, [loadData]);

    return {
      ...data,
      isLoading,
      error,
      refetch: () => loadData(),
    };
  }
