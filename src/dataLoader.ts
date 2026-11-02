import { caseApi } from './api/caseApi.js';
import type { CaseData, Person, Location, TimelineEvent, Evidence } from './types.js';

/**
 * Backward compatibility facade re-exporting from Layer 1 API access module (src/api/caseApi.ts)
 */
export const fetchCaseData = (signal?: AbortSignal): Promise<CaseData> =>
  caseApi.getCase(signal);

export const fetchPeopleData = (signal?: AbortSignal): Promise<Person[]> =>
  caseApi.getPeople(signal);

export const fetchLocationsData = (signal?: AbortSignal): Promise<Location[]> =>
  caseApi.getLocations(signal);

export const fetchTimelineData = (signal?: AbortSignal): Promise<TimelineEvent[]> =>
  caseApi.getTimeline(signal);

export const fetchEvidenceData = (
  signal?: AbortSignal,
  overrideQuery?: string
): Promise<Evidence[]> => caseApi.getEvidence(signal, overrideQuery);

export { caseApi };
