export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-[var(--card)] p-8 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
        <div className="mx-auto h-10 w-32 animate-pulse rounded-xl bg-slate-200 dark:bg-[var(--surface-elevated)]" />
        <div className="mt-10 h-8 w-64 max-w-full animate-pulse rounded-xl bg-slate-200 dark:bg-[var(--surface-elevated)]" />
        <div className="mt-8 space-y-4">
          <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-[var(--surface-elevated)]" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-[var(--surface-elevated)]" />
          <div className="h-12 animate-pulse rounded-xl bg-indigo-200 dark:bg-indigo-500/20" />
        </div>
      </div>
    </div>
  );
}
