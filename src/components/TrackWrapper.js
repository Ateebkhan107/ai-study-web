"use client";

import { createContext, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const ExamTrackContext = createContext({ examTrack: "JEE", isSignedIn: false });

export function usePracticeExamTrack() {
  const { examTrack, isSignedIn } = useContext(ExamTrackContext);
  const previewTrack = useSearchParams().get("track")?.toUpperCase();
  return !isSignedIn && (previewTrack === "JEE" || previewTrack === "NEET")
    ? previewTrack
    : examTrack;
}

export default function TrackWrapper({ children, examTrack, isSignedIn }) {
  const pathname = usePathname();
  const isFullScreenSession = pathname === "/pyq/session" || pathname === "/test/session";

  if (isFullScreenSession) {
    return <main className="w-full min-w-0 h-screen overflow-hidden p-0 m-0">{children}</main>;
  }

  return (
    <div className="track-wrapper min-w-0">
      <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
        <ExamTrackContext.Provider value={{ examTrack, isSignedIn }}>
          {children}
        </ExamTrackContext.Provider>
      </main>
    </div>
  );
}
