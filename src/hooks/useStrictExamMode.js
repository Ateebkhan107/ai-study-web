"use client";

import { useEffect, useRef } from "react";

export function useStrictExamMode(isActive) {
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;

    // Fullscreen API Management
    if (isActive) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request failed:", err);
        });
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn("Exit fullscreen failed:", err);
        });
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActiveRef.current) return;

    const navWarning = "You cannot leave an active exam session. Please submit or finish first.";

    // 1. Prevent tab close / refresh
    const handleBeforeUnload = (e) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 2. Prevent back button
    window.history.pushState({ isExamSession: true }, "", window.location.href);
    const handlePopState = (e) => {
      if (!isActiveRef.current) return;
      window.history.pushState({ isExamSession: true }, "", window.location.href);
      alert(navWarning);
    };
    window.addEventListener("popstate", handlePopState);

    // 3. Prevent accidental key navigation
    const handleKeyDown = (e) => {
      if (!isActiveRef.current) return;
      // F5
      if (e.key === "F5") {
        e.preventDefault();
      }
      // Ctrl+R / Cmd+R
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
      }
      // Alt+Left (Browser Back)
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
      }
      // Backspace (outside of inputs)
      if (e.key === "Backspace") {
        const activeElement = document.activeElement;
        const isInput = activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";
        if (!isInput) {
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // 4. Detect tab switching / minimization
    const handleVisibilityChange = () => {
      if (!isActiveRef.current) return;
      if (document.hidden) {
        recordTabSwitch();
      }
    };
    const handleBlur = () => {
      if (!isActiveRef.current) return;
      recordTabSwitch();
    };

    const recordTabSwitch = () => {
      let count = parseInt(sessionStorage.getItem("exam_tab_switches") || "0", 10);
      count++;
      sessionStorage.setItem("exam_tab_switches", count.toString());
      alert(`Warning: You have switched tabs or minimized the window. (Count: ${count}). This action has been recorded.`);
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    // 5. Prevent internal Next.js link clicks (fallback)
    const handleGlobalClick = (e) => {
      if (!isActiveRef.current) return;
      const anchor = e.target.closest("a");
      if (anchor && anchor.href) {
        try {
          const targetUrl = new URL(anchor.href, window.location.origin);
          const currentUrl = new URL(window.location.href);
          if (targetUrl.pathname !== currentUrl.pathname) {
            e.preventDefault();
            e.stopPropagation();
            alert(navWarning);
          }
        } catch (err) {}
      }
    };
    window.addEventListener("click", handleGlobalClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("click", handleGlobalClick, true);
    };
  }, []); // Setup event listeners once
}
