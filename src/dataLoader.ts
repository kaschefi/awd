import type { CaseData, Person, Location, TimelineEvent, Evidence } from './types.js';

// Helper to determine query parameters (e.g. ?delay=2000, ?error=500, ?empty=true)
function getSimulationQuery(): string {
  if (typeof window !== 'undefined' && window.location.search) {
    return window.location.search;
  }
  return '';
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let errMessage = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.error) {
        errMessage = errJson.error;
      }
    } catch {
      // Body not JSON
    }
    throw new Error(`Failed to fetch ${url}: ${errMessage}`);
  }
  return (await res.json()) as T;
}

// Demo 5: Consume backend REST API endpoints with fallback for static GitHub Pages deployment
async function fetchResource<T>(apiEndpoint: string, staticFallback: string): Promise<T> {
  const query = getSimulationQuery();
  const primaryUrl = `${apiEndpoint}${query}`;

  try {
    return await fetchJson<T>(primaryUrl);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // If this is a deliberate simulated 500 or 404 from the backend, re-throw it so error UI is tested!
    if (errorMsg.includes('500') || errorMsg.includes('Simulated')) {
      throw err;
    }

    // In static deployments (e.g. GitHub Pages) where /api doesn't exist, fall back to static JSON
    console.warn(`[dataLoader] Primary endpoint ${primaryUrl} failed, falling back to ${staticFallback}:`, err);
    return await fetchJson<T>(staticFallback);
  }
}

export async function fetchCaseData(): Promise<CaseData> {
  return fetchResource<CaseData>('/api/case', './data/case.json');
}

export async function fetchPeopleData(): Promise<Person[]> {
  return fetchResource<Person[]>('/api/people', './data/people.json');
}

export async function fetchLocationsData(): Promise<Location[]> {
  return fetchResource<Location[]>('/api/locations', './data/locations.json');
}

export async function fetchTimelineData(): Promise<TimelineEvent[]> {
  return fetchResource<TimelineEvent[]>('/api/timeline', './data/timeline.json');
}

export async function fetchEvidenceData(): Promise<Evidence[]> {
  return fetchResource<Evidence[]>('/api/evidence', './data/evidence.json');
}
