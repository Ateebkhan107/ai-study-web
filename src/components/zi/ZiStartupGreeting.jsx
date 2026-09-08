"use client";

import { useEffect, useState } from "react";
import ZiCoreOrb from "@/components/zi/ZiCoreOrb";

const STARTUP_GREETING_KEY = "zi_startup_greeted";
const GREETING_DELAY_MS = 300;
const SECONDARY_DELAY_MS = 1400;
const FADE_DELAY_MS = 3200;
const REMOVE_DELAY_MS = 3800;

function getGreetingLine(name) {
  const hour = new Date().getHours();
  const suffix = name ? `, ${name}` : "";

  if (hour >= 5 && hour < 12) return `Good morning${suffix}.`;
  if (hour >= 12 && hour < 18) return name ? `Hey ${name}.` : "Hey.";
  if (hour >= 18) return `Good evening${suffix}.`;
  return name ? `Still up, ${name}?` : "Still up?";
}

export default function ZiStartupGreeting({
  displayName = "",
  disabled = false,
  onActiveChange,
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return undefined;

    try {
      if (window.sessionStorage.getItem(STARTUP_GREETING_KEY)) return undefined;
      window.sessionStorage.setItem(STARTUP_GREETING_KEY, "true");
    } catch {
      return undefined;
    }

    const timers = [
      window.setTimeout(() => {
        setShouldRender(true);
        setIsVisible(true);
        onActiveChange?.(true);
      }, GREETING_DELAY_MS),
      window.setTimeout(() => setShowSecondary(true), SECONDARY_DELAY_MS),
      window.setTimeout(() => setIsVisible(false), FADE_DELAY_MS),
      window.setTimeout(() => {
        setShouldRender(false);
        onActiveChange?.(false);
      }, REMOVE_DELAY_MS),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      onActiveChange?.(false);
    };
  }, [disabled, onActiveChange]);

  if (!shouldRender || disabled) return null;

  const greetingLine = getGreetingLine(displayName);

  return (
    <div
      className={`zi-startup-greeting fixed right-4 z-[54] flex max-w-[min(20rem,calc(100vw-2rem))] items-center gap-3 rounded-2xl border border-brand/25 bg-[#0f0d09]/95 px-3 py-3 text-white shadow-[0_18px_48px_rgba(0,0,0,0.35),0_0_32px_rgba(234,179,8,0.14)] backdrop-blur-xl transition-opacity duration-500 motion-reduce:transition-opacity sm:right-7 ${
        isVisible ? "opacity-100" : "opacity-0"
      } bottom-[calc(12.75rem+env(safe-area-inset-bottom))] sm:bottom-[calc(11.25rem+env(safe-area-inset-bottom))]`}
      aria-live="polite"
      aria-atomic="true"
    >
      <ZiCoreOrb size="sm" state="speaking" />
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-black leading-5 text-white">
          {greetingLine}
        </p>
        <p
          className={`mt-1 truncate text-xs font-bold text-amber-100/80 transition-opacity duration-500 ${
            showSecondary ? "opacity-100" : "opacity-0"
          }`}
        >
          Ready when you are.
        </p>
      </div>
    </div>
  );
}
