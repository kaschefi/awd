import type { CaseData, Person, Location, TimelineEvent, Evidence } from './types.js';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function fetchCaseData(): Promise<CaseData> {
  return fetchJson<CaseData>('./data/case.json');
}

export async function fetchPeopleData(): Promise<Person[]> {
  return fetchJson<Person[]>('./data/people.json');
}

export async function fetchLocationsData(): Promise<Location[]> {
  return fetchJson<Location[]>('./data/locations.json');
}

export async function fetchTimelineData(): Promise<TimelineEvent[]> {
  return fetchJson<TimelineEvent[]>('./data/timeline.json');
}

export async function fetchEvidenceData(): Promise<Evidence[]> {
  return fetchJson<Evidence[]>('./data/evidence.json');
}
