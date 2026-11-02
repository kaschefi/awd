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

  const loadData = useCallback(async (cancelledRef?: { current: boolean }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[usePortalData] Fetching resources from backend /api/* endpoints...');
      const [caseData, people, locations, timeline, evidence] = await Promise.all([
        fetchCaseData(),
        fetchPeopleData(),
        fetchLocationsData(),
        fetchTimelineData(),
        fetchEvidenceData(),
      ]);

      if (cancelledRef?.current) return;

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
    } catch (err) {
      if (cancelledRef?.current) return;
      console.error('[usePortalData] Network fetch failed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (!cancelledRef?.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Demo 5: Data fetching wired inside useEffect
  useEffect(() => {
    const cancelledRef = { current: false };

    loadData(cancelledRef);

    return () => {
      cancelledRef.current = true;
    };
  }, [loadData]);

  return {
    ...data,
    isLoading,
    error,
    refetch: loadData,
  };
}
