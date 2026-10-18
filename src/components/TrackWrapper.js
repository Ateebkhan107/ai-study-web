"use client";

import { usePathname } from "next/navigation";

export default function TrackWrapper({ children }) {
  const pathname = usePathname();
  const isFullScreenSession = pathname === "/pyq/session" || pathname === "/test/session";

  if (isFullScreenSession) {
    return <main className="w-full min-w-0 h-screen overflow-hidden p-0 m-0">{children}</main>;
  }

  return (
    <div className="track-wrapper min-w-0">
      <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
