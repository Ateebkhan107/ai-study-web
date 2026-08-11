"use client";

export default function TrackWrapper({ children }) {
  return (
    <div className="track-wrapper min-w-0">
      <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
