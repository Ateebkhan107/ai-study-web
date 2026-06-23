"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrackWrapper({ children }) {
  const pathname = usePathname();
  const [currentTrack, setCurrentTrack] = useState("mixed");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Read the permanent hand-stamp cookie directly
      const match = document.cookie.match(new RegExp('(^| )prepzii_track=([^;]+)'));
      if (match) {
        setCurrentTrack(match[2]);
      }
    }
  }, [pathname]);

  return (
    <div className={`track-wrapper track-${currentTrack}`}>
      {/* ❌ REMOVED THE OLD TARGET ENGINE STATUS BANNER ROW FROM HERE ❌ */}
      
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}