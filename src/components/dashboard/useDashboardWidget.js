"use client";

import { useCallback, useEffect, useState } from "react";

export function useDashboardWidget(url, userId, { refreshOnFocus = false } = {}) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Dashboard widget returned ${response.status}`);
        const data = await response.json();
        if (!controller.signal.aborted) {
          setResult({ url, userId, attempt, data, status: "success", rankUnavailable: response.headers.get("x-prepzii-rank-unavailable") === "1" });
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult((previous) => ({
            url, userId, attempt, status: "error",
            data: previous?.url === url && previous.userId === userId ? previous.data : null,
          }));
        }
      }
    }

    load();
    return () => controller.abort();
  }, [attempt, url, userId]);

  useEffect(() => {
    if (!refreshOnFocus || !userId) return;
    window.addEventListener("focus", retry);
    return () => window.removeEventListener("focus", retry);
  }, [refreshOnFocus, retry, userId]);

  const current = result && result.userId === userId && result.url === url ? result : null;
  return {
    data: current?.data ?? null,
    status: current?.attempt === attempt ? current.status : "loading",
    rankUnavailable: current?.rankUnavailable ?? false,
    retry,
  };
}
