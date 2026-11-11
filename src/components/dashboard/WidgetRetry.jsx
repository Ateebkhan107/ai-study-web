"use client";

import { useRouter } from "next/navigation";

export default function WidgetRetry({ message, retry }) {
  const router = useRouter();
  return (
    <div role="status" className="rounded-xl border border-[var(--border)] p-3 text-sm text-[var(--foreground)]">
      <p>{message}</p>
      <button type="button" className="mt-1.5 font-bold underline underline-offset-2" onClick={retry || (() => router.refresh())}>
        Try again
      </button>
    </div>
  );
}
