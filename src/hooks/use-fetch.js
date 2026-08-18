import { useEffect, useState, useCallback } from "react";

/**
 * Minimal data-fetching hook with loading / error / refetch state.
 *
 * @param {(opts: { signal: AbortSignal }) => Promise<any>} fetcher
 * @param {Array} deps - re-run when these change
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetcher({ signal: controller.signal })
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active && err.name !== "AbortError") setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, refetch };
}
