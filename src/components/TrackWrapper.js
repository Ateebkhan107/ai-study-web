"use client";

export default function TrackWrapper({ children }) {
  return (
    <div className="track-wrapper">
      {/* ❌ REMOVED THE OLD TARGET ENGINE STATUS BANNER ROW FROM HERE ❌ */}
      
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
