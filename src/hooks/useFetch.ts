import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseFetchOptions<T> {
  initialData?: T;
  fallbackUrl?: string;
  enabled?: boolean;
}

/**
 * Demo 8: Reusable custom hook encapsulating data-fetching lifecycle,
 * tri-state status (loading/error/empty), and AbortController request cancellation.
 */
export function useFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const { initialData = null, fallbackUrl, enabled = true } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [refetchIndex, setRefetchIndex] = useState<number>(0);

  const activeControllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    setRefetchIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    // Cancel any in-flight request before starting a new one
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // Forward simulation query params from window.location.search if present
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const fullUrl = url.includes('?') ? `${url}&${search.replace(/^\?/, '')}` : `${url}${search}`;

    async function executeFetch() {
      try {
        const res = await fetch(fullUrl, { signal: controller.signal });

        if (!res.ok) {
          let msg = `HTTP ${res.status} ${res.statusText}`;
          try {
            const errBody = await res.json();
            if (errBody && errBody.error) msg = errBody.error;
          } catch {
            // Not JSON
          }
          throw new Error(msg);
        }

        const json = (await res.json()) as T;
        if (isMounted) {
          setData(json);
          setError(null);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`[useFetch] Request to ${url} was aborted via AbortController`);
          return;
        }

        // If fallback URL provided (e.g. for static GitHub Pages) and backend endpoint failed:
        if (fallbackUrl && (!err || !(err as Error).message?.includes('500'))) {
          try {
            console.warn(`[useFetch] Primary endpoint ${fullUrl} failed, trying fallback ${fallbackUrl}`);
            const fbRes = await fetch(fallbackUrl, { signal: controller.signal });
            if (fbRes.ok) {
              const fbJson = (await fbRes.json()) as T;
              if (isMounted) {
                setData(fbJson);
                setError(null);
                return;
              }
            }
          } catch {
            // Fallback also failed; proceed to setError below
          }
        }

        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    executeFetch();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url, refetchIndex, enabled, fallbackUrl]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

