import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!posthogKey) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[PostHog] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not configured. Analytics events will be skipped in development."
    );
  }
} else if (!posthogHost) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[PostHog] NEXT_PUBLIC_POSTHOG_HOST is not configured. Analytics events will be skipped in development."
    );
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}
