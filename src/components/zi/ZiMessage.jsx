import { Bot, UserRound } from "lucide-react";

export default function ZiMessage({
  role = "zi",
  children,
  isLoading = false,
  tone = "default",
}) {
  const isUser = role === "user";
  const isError = tone === "error";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/25 bg-[var(--surface-elevated)] text-brand"
          aria-hidden="true"
        >
          <Bot className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
      ) : null}

      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
          isUser
            ? "rounded-br-md bg-[#161513] text-white dark:bg-brand dark:text-black"
            : isError
            ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300"
            : "rounded-bl-md border border-slate-200/70 bg-slate-50 text-slate-800 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)]/70 dark:text-slate-100"
        }`}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span>Zi is thinking</span>
            <span className="inline-flex gap-1" aria-hidden="true">
              <span className="h-1 w-1 rounded-full bg-current motion-safe:animate-pulse" />
              <span className="h-1 w-1 rounded-full bg-current motion-safe:animate-pulse [animation-delay:120ms]" />
              <span className="h-1 w-1 rounded-full bg-current motion-safe:animate-pulse [animation-delay:240ms]" />
            </span>
          </span>
        ) : (
          children
        )}
      </div>

      {isUser ? (
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-300"
          aria-hidden="true"
        >
          <UserRound className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
      ) : null}
    </div>
  );
}
