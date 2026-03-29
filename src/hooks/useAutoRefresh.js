import { useEffect } from "react";

/**
 * useAutoRefresh
 * Automatically re-fetches data on two triggers:
 *  1. Every `intervalMs` ms (background poll)
 *  2. When the browser tab becomes visible again (tab-focus sync)
 *
 * Usage:
 *   import useAutoRefresh from "../../hooks/useAutoRefresh";
 *   useAutoRefresh(loadData);           // 30s default
 *   useAutoRefresh(loadData, 20_000);   // every 20s
 */
export default function useAutoRefresh(fetchFn, intervalMs = 30_000) {
  /* ── 1. Background poll ── */
  useEffect(() => {
    const id = setInterval(() => { fetchFn(); }, intervalMs);
    return () => clearInterval(id);
  }, [fetchFn, intervalMs]);

  /* ── 2. Tab-focus sync ── */
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchFn();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [fetchFn]);
}
