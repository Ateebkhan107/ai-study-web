"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ProductTour } from "./ProductTour";

export function startProductTour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("prepzii:start-tour"));
  }
}

export function ProductTourManager() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [tourActive, setTourActive] = useState(false);
  const [initialPhase, setInitialPhase] = useState("welcome");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isLoaded || !user) return;

    const tourParam = searchParams.get("tour");
    const isCompletedInMeta = Boolean(user.publicMetadata?.productTourCompleted);
    const isCompletedInStorage =
      typeof window !== "undefined" &&
      window.localStorage.getItem("prepzii_tour_completed") === "true";

    // 1. Check if explicitly triggered via URL (e.g. from onboarding redirect ?tour=welcome)
    if (tourParam === "welcome") {
      setInitialPhase("welcome");
      setTourActive(true);
      // Clean up URL query param without refreshing page
      if (typeof window !== "undefined") {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      return;
    }

    if (tourParam === "start") {
      setInitialPhase("tour");
      setTourActive(true);
      if (typeof window !== "undefined") {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      return;
    }

    // 2. Check if genuinely new user who hasn't completed tour yet
    if (!isCompletedInMeta && !isCompletedInStorage) {
      // If user is brand new and on /dashboard, show welcome screen
      if (typeof window !== "undefined" && window.location.pathname === "/dashboard") {
        setInitialPhase("welcome");
        setTourActive(true);
      }
    }
  }, [isLoaded, user, searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Listen for replay events from Profile / Help
  useEffect(() => {
    function handleReplay() {
      setInitialPhase("welcome");
      setTourActive(true);
    }

    window.addEventListener("prepzii:start-tour", handleReplay);
    return () => window.removeEventListener("prepzii:start-tour", handleReplay);
  }, []);

  const markTourComplete = () => {
    setTourActive(false);

    // Save in localStorage immediately for instant local sync
    if (typeof window !== "undefined") {
      window.localStorage.setItem("prepzii_tour_completed", "true");
    }

    // Save in Clerk user metadata via server API
    startTransition(async () => {
      try {
        await fetch("/api/user/tour-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("[TOUR_SAVE_ERROR]", err);
      }
    });
  };

  const markTourDismissed = () => {
    setTourActive(false);
    // Persist dismissed state so it doesn't auto-pop again
    if (typeof window !== "undefined") {
      window.localStorage.setItem("prepzii_tour_completed", "true");
    }

    startTransition(async () => {
      try {
        await fetch("/api/user/tour-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("[TOUR_DISMISS_SAVE_ERROR]", err);
      }
    });
  };

  if (!tourActive) return null;

  return (
    <ProductTour
      initialPhase={initialPhase}
      onComplete={markTourComplete}
      onDismiss={markTourDismissed}
    />
  );
}

export default ProductTourManager;
