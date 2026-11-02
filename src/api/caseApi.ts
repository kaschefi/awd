import type { CaseData, Person, Location, TimelineEvent, Evidence } from '../types.js';

function getSimulationQuery(): string {
  if (typeof window !== 'undefined' && window.location.search) {
    return window.location.search;
  }
  return '';
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
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

// Layer 1: Thin API Access Layer helper with static fallback for GitHub Pages
async function request<T>(
  apiEndpoint: string,
  staticFallback: string,
  signal?: AbortSignal,
  overrideQuery?: string
): Promise<T> {
  const query = overrideQuery !== undefined ? overrideQuery : getSimulationQuery();
  const primaryUrl = `${apiEndpoint}${query}`;

  try {
    return await fetchJson<T>(primaryUrl, signal);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }

    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('500') || errorMsg.includes('Simulated')) {
      throw err;
    }

    console.warn(
      `[caseApi] Primary endpoint ${primaryUrl} failed, falling back to ${staticFallback}:`,
      err
    );
    return await fetchJson<T>(staticFallback, signal);
  }
}

/**
 * Layer 1: Dedicated, Thin API-Access Layer.
 * Knows endpoint URLs, HTTP methods, headers, and response serialization.
 * Pure async functions returning typed promises. Contains zero React state and zero JSX.
 */
export const caseApi = {
  getCase: (signal?: AbortSignal) => request<CaseData>('/api/case', './data/case.json', signal),

  getPeople: (signal?: AbortSignal) =>
    request<Person[]>('/api/people', './data/people.json', signal),

  getLocations: (signal?: AbortSignal) =>
    request<Location[]>('/api/locations', './data/locations.json', signal),

  getTimeline: (signal?: AbortSignal) =>
    request<TimelineEvent[]>('/api/timeline', './data/timeline.json', signal),

  getEvidence: (signal?: AbortSignal, query?: string) =>
    request<Evidence[]>('/api/evidence', './data/evidence.json', signal, query),
};

