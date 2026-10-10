"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const sansFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className={`${sansFont.variable} font-sans min-h-full flex flex-col items-center justify-center antialiased bg-[var(--background)]`}>
        <main className="flex flex-col items-center justify-center p-8 text-center max-w-md bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--border)]">
          <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3 text-[var(--foreground)]">
            Something went wrong
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-black focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
