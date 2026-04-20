import { useEffect, useRef } from "react";


export default function useAutoRefresh(fetchFn, intervalMs = 15_000) {
  const savedFetchFn = useRef();

  // Remember the latest fetch function seamlessly
  useEffect(() => {
    savedFetchFn.current = fetchFn;
  }, [fetchFn]);

  /* ── 1. Background poll ── */
  useEffect(() => {
    const id = setInterval(() => { 
      if (savedFetchFn.current) savedFetchFn.current(); 
    }, intervalMs);
    
    return () => clearInterval(id);
  }, [intervalMs]);

  /* ── 2. Tab-focus sync ── */
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && savedFetchFn.current) {
        savedFetchFn.current();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);
}
