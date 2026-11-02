import type { CaseData, Person, Location, TimelineEvent, Evidence } from './types.js';

// Helper to determine query parameters (e.g. ?delay=2000, ?error=500, ?empty=true)
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

    // Demo 5 & 7: Consume backend REST API endpoints with AbortSignal cancellation support
    async function fetchResource<T>(
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
        // If request was intentionally aborted via AbortController, let AbortError bubble up!
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }

        const errorMsg = err instanceof Error ? err.message : String(err);

        // If this is a deliberate simulated 500 or 404 from the backend, re-throw it so error UI is tested!
        if (errorMsg.includes('500') || errorMsg.includes('Simulated')) {
          throw err;
        }

        // In static deployments (e.g. GitHub Pages) where /api doesn't exist, fall back to static JSON
        console.warn(
          `[dataLoader] Primary endpoint ${primaryUrl} failed, falling back to ${staticFallback}:`,
          err
        );
        return await fetchJson<T>(staticFallback, signal);
      }
    }

      export async function fetchCaseData(signal?: AbortSignal): Promise<CaseData> {
        return fetchResource<CaseData>('/api/case', './data/case.json', signal);
      }

        export async function fetchPeopleData(signal?: AbortSignal): Promise<Person[]> {
          return fetchResource<Person[]>('/api/people', './data/people.json', signal);
        }

          export async function fetchLocationsData(signal?: AbortSignal): Promise<Location[]> {
            return fetchResource<Location[]>('/api/locations', './data/locations.json', signal);
          }

            export async function fetchTimelineData(signal?: AbortSignal): Promise<TimelineEvent[]> {
              return fetchResource<TimelineEvent[]>('/api/timeline', './data/timeline.json', signal);
            }

              export async function fetchEvidenceData(
                signal?: AbortSignal,
                overrideQuery?: string
              ): Promise<Evidence[]> {
                return fetchResource<Evidence[]>('/api/evidence', './data/evidence.json', signal, overrideQuery);
              }
