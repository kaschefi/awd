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
}

export function usePortalData(): PortalData {
  const [data, setData] = useState<PortalData>(() => ({
    caseData: state.caseData,
    evidence: state.allEvidence,
    people: state.allPeople,
    locations: state.allLocations,
    timeline: state.allTimeline,
    bookmarks: state.bookmarks,
    isLoading: state.allEvidence.length === 0 || !state.caseData.title,
  }));

  const updateFromState = useCallback(() => {
    setData({
      caseData: { ...state.caseData },
      evidence: [...state.allEvidence],
      people: [...state.allPeople],
      locations: [...state.allLocations],
      timeline: [...state.allTimeline],
      bookmarks: [...state.bookmarks],
      isLoading: state.allEvidence.length === 0 || !state.caseData.title,
    });
  }, []);

  useEffect(() => {
    // If state is already populated by app.ts, synchronize immediately
    if (state.allEvidence.length > 0 && state.caseData.title) {
      updateFromState();
      return;
    }

    // Listen for custom event from app.ts when loadAllData completes
    const handleLoaded = () => {
      updateFromState();
    };
    window.addEventListener('portal:dataloaded', handleLoaded);

    // Fallback: If data is not yet in state, fetch directly to guarantee availability
    const timer = setTimeout(async () => {
      if (state.allEvidence.length === 0) {
        try {
          const [caseData, people, locations, timeline, evidence] = await Promise.all([
            fetchCaseData(),
            fetchPeopleData(),
            fetchLocationsData(),
            fetchTimelineData(),
            fetchEvidenceData(),
          ]);
          state.caseData = caseData;
          state.allPeople = people;
          state.allLocations = locations;
          state.allTimeline = timeline;
          state.allEvidence = evidence;
          updateFromState();
        } catch (err) {
          console.error('Failed to load portal data in React:', err);
        }
      }
    }, 200);

    return () => {
      window.removeEventListener('portal:dataloaded', handleLoaded);
      clearTimeout(timer);
    };
  }, [updateFromState]);

  return data;
}
