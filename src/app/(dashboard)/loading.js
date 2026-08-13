export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] px-4 py-5 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="h-14 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/70" />
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.9fr)]">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
        </div>
      </div>
    </div>
  );
}
